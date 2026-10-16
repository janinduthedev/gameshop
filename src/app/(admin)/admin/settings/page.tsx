import { requireAdmin } from "@/lib/dal";
import { ChangePasswordCard } from "@/components/storefront/change-password-card";

export const metadata = { title: "Admin Settings" };

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your administrator account credentials and security settings.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Account details</h2>
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">
            Name: <span className="font-medium text-foreground">{admin.name}</span>
          </p>
          <p className="text-muted-foreground">
            Email: <span className="font-medium text-foreground">{admin.email}</span>
          </p>
          <p className="text-muted-foreground">
            Role: <span className="font-medium uppercase text-foreground">{admin.role}</span>
          </p>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
