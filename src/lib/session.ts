import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Every server action and data read starts here. The returned id is the
// only source of truth for ownership; never accept a userId from the client.
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}