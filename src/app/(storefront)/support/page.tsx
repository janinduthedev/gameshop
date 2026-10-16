import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { SupportForm } from "@/components/storefront/support-form";
import { getSession } from "@/lib/dal";

export const metadata = { title: "Contact support" };

const HIGHLIGHTS = [
  {
    icon: Mail,
    title: "Email us",
    description: "support@gamestore.dev",
  },
  {
    icon: MessageSquare,
    title: "Response time",
    description: "Within 24 hours on business days",
  },
];

export default async function SupportPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <LifeBuoy className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">Contact support</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Need help with your account or an order? Send us a message and our
          team will get back to you.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-lg border bg-card p-4"
          >
            <item.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <SupportForm
          defaultName={session?.user?.name ?? ""}
          defaultEmail={session?.user?.email ?? ""}
        />
      </div>
    </div>
  );
}
