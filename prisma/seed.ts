import { PrismaClient, ApplicationStatus, ImportSource } from "@prisma/client";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

type Seed = {
  company: string;
  title: string;
  location: string;
  status: ApplicationStatus;
  appliedDaysAgo?: number;
  source?: ImportSource;
  url?: string;
};

const seeds: Seed[] = [
  { company: "Safaricom", title: "Data Engineer", location: "Nairobi, Kenya", status: "SAVED", url: "https://example.com/jobs/safaricom-data-engineer" },
  { company: "Flutterwave", title: "Backend Engineer", location: "Remote", status: "SAVED", source: "EXTENSION", url: "https://example.com/jobs/flutterwave-backend" },
  { company: "Andela", title: "Full-Stack Engineer", location: "Remote", status: "APPLIED", appliedDaysAgo: 2, source: "EXTENSION", url: "https://example.com/jobs/andela-fullstack" },
  { company: "Wave", title: "Software Engineer", location: "Dakar, Senegal", status: "APPLIED", appliedDaysAgo: 6, url: "https://example.com/jobs/wave-swe" },
  { company: "M-KOPA", title: "Machine Learning Engineer", location: "Nairobi, Kenya", status: "INTERVIEWING", appliedDaysAgo: 14, url: "https://example.com/jobs/mkopa-ml" },
  { company: "Twiga Foods", title: "Software Engineer", location: "Nairobi, Kenya", status: "REJECTED", appliedDaysAgo: 21 },
  { company: "Cellulant", title: "Platform Engineer", location: "Nairobi, Kenya", status: "ACCEPTED", appliedDaysAgo: 30 },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a production database.");
  }

  const user = await prisma.user.upsert({
    where: { email: "demo@apexhire.dev" },
    update: {},
    create: { email: "demo@apexhire.dev", name: "Demo User" },
  });

  await prisma.application.deleteMany({ where: { userId: user.id } });

  const positions: Record<string, number> = {};

  for (const s of seeds) {
    positions[s.status] = (positions[s.status] ?? 0) + 1000;

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        company: s.company,
        title: s.title,
        location: s.location,
        url: s.url,
        status: s.status,
        source: s.source ?? "MANUAL",
        position: positions[s.status],
        appliedDate: s.appliedDaysAgo ? daysAgo(s.appliedDaysAgo) : null,
      },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, applicationId: app.id, action: "CREATED", toStatus: s.status },
    });

    if (s.status !== "SAVED") {
      await prisma.stageEvent.create({
        data: {
          userId: user.id,
          applicationId: app.id,
          fromStatus: "SAVED",
          toStatus: s.status,
          occurredAt: s.appliedDaysAgo ? daysAgo(s.appliedDaysAgo) : new Date(),
        },
      });
    }
  }

  console.log(`Seeded ${seeds.length} applications for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());