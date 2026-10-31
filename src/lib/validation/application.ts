import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Only http(s) links are accepted, so a stored value can never be a
// javascript: URL when it is rendered as a link.
const optionalUrl = z
  .string()
  .trim()
  .max(2048, "This link is too long")
  .transform((value) => (value === "" ? undefined : value))
  .refine((value) => value === undefined || isHttpUrl(value), {
    message: "Enter a full link starting with http:// or https://",
  })
  .optional();

export const applicationFieldsSchema = z.object({
  company: z.string().trim().min(1, "Enter the company name").max(120, "Keep this under 120 characters"),
  title: z.string().trim().min(1, "Enter the job title").max(160, "Keep this under 160 characters"),
  location: optionalText(120),
  url: optionalUrl,
  salaryText: optionalText(80),
  notes: optionalText(4000),
});

export const updateApplicationSchema = applicationFieldsSchema.extend({
  id: z.string().min(1),
  version: z.coerce.number().int().min(1),
});

export const deleteApplicationSchema = z.object({ id: z.string().min(1) });

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

// Echoes submitted text fields back so the form keeps what the user typed.
export function fieldValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION") && key !== "id" && key !== "version") {
      out[key] = value;
    }
  }
  return out;
}