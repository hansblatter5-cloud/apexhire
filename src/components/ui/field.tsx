import type { ReactNode } from "react";

export const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground";

export const textareaClass =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground";

export function Field({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted-foreground">optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}