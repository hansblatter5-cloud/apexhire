"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  applicationFieldsSchema,
  deleteApplicationSchema,
  fieldValues,
  updateApplicationSchema,
  type ActionState,
} from "@/lib/validation/application";

const DUPLICATE_URL = "You have already saved this job.";

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createApplication(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = fieldValues(formData);

  const parsed = applicationFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors, values };
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const last = await tx.application.aggregate({
        where: { userId, status: "SAVED" },
        _max: { position: true },
      });

      const application = await tx.application.create({
        data: {
          userId,
          company: data.company,
          title: data.title,
          location: data.location ?? null,
          url: data.url ?? null,
          salaryText: data.salaryText ?? null,
          notes: data.notes ?? null,
          status: "SAVED",
          source: "MANUAL",
          position: (last._max.position ?? 0) + 1000,
        },
      });

      await tx.auditLog.create({
        data: { userId, applicationId: application.id, action: "CREATED", toStatus: "SAVED" },
      });
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { url: [DUPLICATE_URL] }, values };
    }
    console.error("createApplication failed", error);
    return { ok: false, message: "The job could not be saved. Try again.", values };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateApplication(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = fieldValues(formData);

  const parsed = updateApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors, values };
  }
  const { id, version, ...fields } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Matching on id, owner and version makes this an optimistic lock:
      // a stale form or someone else's row updates nothing.
      const { count } = await tx.application.updateMany({
        where: { id, userId, version },
        data: {
          company: fields.company,
          title: fields.title,
          location: fields.location ?? null,
          url: fields.url ?? null,
          salaryText: fields.salaryText ?? null,
          notes: fields.notes ?? null,
          version: { increment: 1 },
        },
      });
      if (count === 0) return false;

      await tx.auditLog.create({ data: { userId, applicationId: id, action: "UPDATED" } });
      return true;
    });

    if (!updated) {
      return {
        ok: false,
        message: "This job was changed elsewhere or no longer exists. Close this panel and open it again.",
        values,
      };
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { url: [DUPLICATE_URL] }, values };
    }
    console.error("updateApplication failed", error);
    return { ok: false, message: "The changes could not be saved. Try again.", values };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteApplication(formData: FormData): Promise<void> {
  const userId = await requireUserId();

  const parsed = deleteApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.application.findFirst({
      where: { id, userId },
      select: { company: true, title: true },
    });
    if (!existing) return;

    // The audit row keeps what was deleted; its applicationId is nulled
    // by the relation when the application row goes.
    await tx.auditLog.create({
      data: { userId, applicationId: id, action: "DELETED", metadata: existing },
    });
    await tx.application.delete({ where: { id } });
  });

  revalidatePath("/dashboard");
}