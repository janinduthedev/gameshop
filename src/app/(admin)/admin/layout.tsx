import { AdminHeader } from "@/components/admin/header";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminOrderNotifier } from "@/components/admin/order-notifier";
import { requireAdmin } from "@/lib/dal";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminOrderNotifier />
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader name={admin.name ?? "Admin"} />
        <AdminMobileNav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
