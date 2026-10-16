import Link from "next/link";
import { AdminOrdersTable } from "@/components/admin/orders-table";
import { getAllOrders } from "@/lib/queries";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
  type OrderStatus,
} from "@/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

type AdminOrdersPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { status } = await searchParams;
  const activeStatus =
    status && ORDER_STATUS_VALUES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : undefined;
  const orders = await getAllOrders(activeStatus);

  const filters: { label: string; value?: OrderStatus }[] = [
    { label: "All", value: undefined },
    ...ORDER_STATUS_VALUES.map((value) => ({
      label: ORDER_STATUS_LABELS[value],
      value,
    })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="text-muted-foreground">
        {orders.length} order(s)
        {activeStatus ? ` · ${ORDER_STATUS_LABELS[activeStatus]}` : ""} placed by
        customers.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.value === activeStatus;
          const href = filter.value
            ? `/admin/orders?status=${filter.value}`
            : "/admin/orders";
          return (
            <Link
              key={filter.label}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border bg-card">
        <AdminOrdersTable orders={orders} />
      </div>
    </div>
  );
}
