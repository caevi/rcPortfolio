import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabaseServer";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Server-side check: signed in AND on the admins allow-list.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?error=not_admin");

  return <AdminDashboard email={admin.email ?? ""} />;
}
