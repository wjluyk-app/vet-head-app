import AdminDashboardClient from "@/components/AdminDashboardClient";
import { requireBillAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireBillAdmin();

  return (
    <>
      <section className="hero">
        <h1>Administrator Dashboard</h1>
        <p>Live tournament setup, scoring and database status</p>
      </section>

      <AdminDashboardClient />
    </>
  );
}
