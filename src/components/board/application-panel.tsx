"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, inputClass, textareaClass } from "@/components/ui/field";
import {
  createApplication,
  deleteApplication,
  updateApplication,
} from "@/app/(app)/dashboard/actions";
import { initialActionState } from "@/lib/validation/application";
import type { ApplicationCard } from "./types";

type FieldName = "company" | "title" | "location" | "url" | "salaryText" | "notes";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving" : children}
    </Button>
  );
}

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
      {pending ? "Deleting" : "Delete job"}
    </Button>
  );
}

function ApplicationForm({
  application,
  onClose,
}: {
  application: ApplicationCard | null;
  onClose: () => void;
}) {
  const isEdit = application !== null;
  const [state, formAction] = useFormState(
    isEdit ? updateApplication : createApplication,
    initialActionState,
  );
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  const initial = (name: FieldName): string => state.values?.[name] ?? application?.[name] ?? "";
  const describe = (name: FieldName) => (errors[name]?.[0] ? `${name}-error` : undefined);

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && (
        <>
          <input type="hidden" name="id" value={application.id} />
          <input type="hidden" name="version" value={application.version} />
        </>
      )}

      {state.message && (
        <p role="alert" className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Field label="Company" htmlFor="company" error={errors.company?.[0]}>
        <input
          id="company"
          name="company"
          defaultValue={initial("company")}
          className={inputClass}
          autoComplete="off"
          aria-invalid={Boolean(errors.company)}
          aria-describedby={describe("company")}
          required
        />
      </Field>

      <Field label="Job title" htmlFor="title" error={errors.title?.[0]}>
        <input
          id="title"
          name="title"
          defaultValue={initial("title")}
          className={inputClass}
          autoComplete="off"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describe("title")}
          required
        />
      </Field>

      <Field label="Location" htmlFor="location" error={errors.location?.[0]} optional>
        <input
          id="location"
          name="location"
          defaultValue={initial("location")}
          className={inputClass}
          autoComplete="off"
          aria-invalid={Boolean(errors.location)}
          aria-describedby={describe("location")}
        />
      </Field>

      <Field label="Link to the posting" htmlFor="url" error={errors.url?.[0]} optional>
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          defaultValue={initial("url")}
          className={inputClass}
          placeholder="https://"
          autoComplete="off"
          aria-invalid={Boolean(errors.url)}
          aria-describedby={describe("url")}
        />
      </Field>

      <Field label="Salary" htmlFor="salaryText" error={errors.salaryText?.[0]} optional>
        <input
          id="salaryText"
          name="salaryText"
          defaultValue={initial("salaryText")}
          className={inputClass}
          autoComplete="off"
          aria-invalid={Boolean(errors.salaryText)}
          aria-describedby={describe("salaryText")}
        />
      </Field>

      <Field label="Notes" htmlFor="notes" error={errors.notes?.[0]} optional>
        <textarea
          id="notes"
          name="notes"
          defaultValue={initial("notes")}
          className={textareaClass}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={describe("notes")}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton>{isEdit ? "Save changes" : "Add job"}</SubmitButton>
      </div>
    </form>
  );
}

function DeleteSection({ id, onDone }: { id: string; onDone: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="mt-10 border-t pt-6">
      {confirming ? (
        <form
          action={async (formData) => {
            await deleteApplication(formData);
            onDone();
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={id} />
          <p className="text-sm">Delete this job? This cannot be undone.</p>
          <div className="flex gap-2">
            <ConfirmDeleteButton />
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
          Delete job
        </Button>
      )}
    </section>
  );
}

export function ApplicationPanel({
  open,
  application,
  onClose,
}: {
  open: boolean;
  application: ApplicationCard | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="panel-title"
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md border-l bg-background p-0 text-foreground backdrop:bg-foreground/20"
    >
      {open && (
        <div className="flex h-full flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
            <h2 id="panel-title" className="text-base font-semibold">
              {application ? "Edit job" : "Add job"}
            </h2>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <ApplicationForm key={application?.id ?? "new"} application={application} onClose={onClose} />
            {application && <DeleteSection id={application.id} onDone={onClose} />}
          </div>
        </div>
      )}
    </dialog>
  );
}