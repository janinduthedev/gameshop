import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Truck } from "lucide-react";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { getOrderById } from "@/lib/queries";
import { ROLES } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = { title: "Order details" };

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const isOwner = order.customer?.email === user.email;
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={isAdmin ? "/admin/orders" : "/account"}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="mb-6 font-semibold">Shipping &amp; Order Status</h2>
        <OrderTimeline status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-semibold">Shipping to</h2>
          <div className="text-sm text-muted-foreground">
            <p className="text-foreground">{order.shipping.fullName}</p>
            <p>{order.shipping.address}</p>
            <p>
              {order.shipping.city}, {order.shipping.postalCode}
            </p>
            <p>{order.shipping.country}</p>
            <p className="mt-2">{order.shipping.phone}</p>
            <p>{order.shipping.email}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-semibold">Payment</h2>
          <p className="text-sm text-muted-foreground">
            {order.paymentMethod === "cod" ? "Cash on delivery" : "Card (demo)"}
          </p>
        </div>
      </div>

      {order.delivery.trackingNumber ? (
        <div className="mt-6 rounded-lg border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Delivery &amp; tracking</h2>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  Courier:{" "}
                  <span className="font-medium text-foreground">
                    {order.delivery.courier || "—"}
                  </span>
                </p>
                <p>
                  Tracking number:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {order.delivery.trackingNumber}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {order.delivery.trackingUrl ? (
                <a
                  href={
                    order.delivery.trackingUrl.includes("{trackingNumber}")
                      ? order.delivery.trackingUrl.replace(
                          "{trackingNumber}",
                          encodeURIComponent(order.delivery.trackingNumber),
                        )
                      : order.delivery.trackingUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open courier site
                  </Button>
                </a>
              ) : null}
              <Link
                href={`/track?number=${encodeURIComponent(order.delivery.trackingNumber)}`}
              >
                <Button className="gap-2">
                  <Truck className="h-4 w-4" />
                  Track package
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 text-right font-medium">Price</th>
              <th className="px-5 py-3 text-center font-medium">Qty</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-t">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                      ) : null}
                    </div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-5 py-4 text-center">{item.quantity}</td>
                <td className="px-5 py-4 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs rounded-lg border bg-card p-5 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {order.shippingFee === 0
                ? "Free"
                : formatCurrency(order.shippingFee)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/products">
          <Button variant="outline">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
