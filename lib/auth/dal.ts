import { redirect } from "next/navigation";
import type { AdminUser } from "@/lib/types";
import { getCurrentAdmin } from "./session";

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
