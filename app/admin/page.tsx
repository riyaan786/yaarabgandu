import type { Metadata } from "next";
import { isAdminSession } from "@/lib/auth";
import AdminSignIn from "@/components/admin/AdminSignIn";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Documentation Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const authed = await isAdminSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <p className="eyebrow">Documentation dashboard</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-deep sm:text-3xl">
        Admin
      </h1>
      <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
        Upload photographs from your phone, write captions and dates, publish or
        unpublish evidence, record pricing details and authority communications,
        and read messages submitted through the corrections form.
      </p>

      <div className="mt-8">
        {authed ? <AdminDashboard /> : <AdminSignIn />}
      </div>
    </div>
  );
}