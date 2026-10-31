"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { ApplicationPanel } from "./application-panel";
import type { ApplicationCard } from "./types";

type PanelState = { mode: "new" } | { mode: "edit"; id: string } | null;

export function Board({ applications }: { applications: ApplicationCard[] }) {
  const [panel, setPanel] = useState<PanelState>(null);
  const close = useCallback(() => setPanel(null), []);

  const editing =
    panel?.mode === "edit" ? (applications.find((item) => item.id === panel.id) ?? null) : null;
  const open = panel?.mode === "new" || (panel?.mode === "edit" && editing !== null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground tabular">
            {applications.length === 1 ? "1 job" : `${applications.length} jobs`}
          </p>
        </div>
        <Button type="button" onClick={() => setPanel({ mode: "new" })}>
          Add job
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="grid min-w-[1000px] grid-cols-5 gap-4">
          {STATUS_ORDER.map((status) => {
            const items = applications.filter((item) => item.status === status);
            const meta = STATUS_META[status];

            return (
              <section key={status} aria-labelledby={`column-${status}`}>
                <header className="flex items-center gap-2 pb-3">
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                  <h2 id={`column-${status}`} className="text-sm font-medium">
                    {meta.label}
                  </h2>
                  <span className="text-sm text-muted-foreground tabular">{items.length}</span>
                </header>

                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed p-3 text-[13px] text-muted-foreground">
                    No applications
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setPanel({ mode: "edit", id: item.id })}
                          className="w-full rounded-md border bg-card p-3 text-left transition-colors hover:bg-accent"
                        >
                          <span className="block text-sm font-medium">{item.company}</span>
                          <span className="mt-0.5 block text-[13px]">{item.title}</span>
                          <span className="mt-2 block text-xs text-muted-foreground">{item.meta}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <ApplicationPanel open={open} application={editing} onClose={close} />
    </div>
  );
}