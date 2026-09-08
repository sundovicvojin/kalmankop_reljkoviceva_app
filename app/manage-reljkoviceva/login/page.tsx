import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { ADMIN_ROUTE } from "@/lib/admin-config";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdminAuthenticated()) {
    redirect(ADMIN_ROUTE);
  }

  return (
    <main className="admin-page">
      <section className="admin-card">
        <p className="eyebrow">KALMAN KOP</p>
        <h1 className="admin-title">Admin pristup</h1>
        <p className="viewer-subtitle">Privatna zona za promenu statusa stanova.</p>
        <LoginForm />
      </section>
    </main>
  );
}
