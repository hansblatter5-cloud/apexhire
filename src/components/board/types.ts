import type { ApplicationStatus } from "@prisma/client";

export type ApplicationCard = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  url: string | null;
  salaryText: string | null;
  notes: string | null;
  status: ApplicationStatus;
  version: number;
  meta: string;
};