import { AdminDashboard } from "@/app/admin/admin-dashboard";
import { HostLoginForm } from "@/app/admin/host-login-form";
import { isHostAuthenticated } from "@/lib/host-auth";

export default async function AdminPage() {
  const isAuthenticated = await isHostAuthenticated();
  return isAuthenticated ? <AdminDashboard /> : <HostLoginForm />;
}
