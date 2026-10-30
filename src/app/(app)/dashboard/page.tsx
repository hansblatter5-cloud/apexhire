export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Applications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No applications yet. Your board will appear here.
      </p>
    </div>
  );
}