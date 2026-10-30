import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <h1 className="text-xl font-semibold">Administration</h1>
      <p className="mt-2 text-sm text-muted-foreground">Restricted to administrators.</p>
    </div>
  );
}