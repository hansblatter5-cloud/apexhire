import type { ApplicationStatus } from "@prisma/client";

export const STATUS_ORDER: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "REJECTED",
  "ACCEPTED",
];

export const STATUS_META: Record<ApplicationStatus, { label: string; dot: string }> = {
  SAVED: { label: "Saved", dot: "bg-status-saved" },
  APPLIED: { label: "Applied", dot: "bg-status-applied" },
  INTERVIEWING: { label: "Interviewing", dot: "bg-status-interviewing" },
  REJECTED: { label: "Rejected", dot: "bg-status-rejected" },
  ACCEPTED: { label: "Accepted", dot: "bg-status-accepted" },
};