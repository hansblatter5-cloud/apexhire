import { Board } from "@/components/board/board";
import { describeAge } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const userId = await requireUserId();

  const rows = await prisma.application.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const now = new Date();
  const applications = rows.map((row) => ({
    id: row.id,
    company: row.company,
    title: row.title,
    location: row.location,
    url: row.url,
    salaryText: row.salaryText,
    notes: row.notes,
    status: row.status,
    version: row.version,
    meta: [
      row.location,
      `${row.appliedDate ? "Applied" : "Saved"} ${describeAge(row.appliedDate ?? row.createdAt, now)}`,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  return <Board applications={applications} />;
}