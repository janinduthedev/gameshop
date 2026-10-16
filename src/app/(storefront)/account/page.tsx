import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { ChangePasswordCard } from "@/components/storefront/change-password-card";
import { requireUser } from "@/lib/dal";
import { getUserOrders } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="mt-8">
        <ChangePasswordCard />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Order history</h2>

      {orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-lg border bg-card py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">You have no orders yet.</p>
          <Link href="/products">
            <Button>Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {order.items[0]?.image ? (
                    <Image
                      src={order.items[0].image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items.length} item(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-semibold">{formatCurrency(order.total)}</span>
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
