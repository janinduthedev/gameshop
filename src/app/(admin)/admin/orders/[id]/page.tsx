import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { OrderStatusProgress } from "@/components/admin/order-status-progress";
import { DeliveryForm } from "@/components/admin/delivery-form";
import { ActionButton } from "@/components/admin/action-button";
import { deleteOrderAction, updateDeliveryAction } from "@/actions/order";
import { getOrderById } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Order details" };

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const deliveryReady = Boolean(
    order.delivery.courier.trim() && order.delivery.trackingNumber.trim(),
  );

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)} · Updated{" "}
            {formatDate(order.updatedAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 rounded-lg border bg-card p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Order status</h2>
          <p className="text-xs text-muted-foreground">
            Click any step to move the order to that status.
          </p>
        </div>
        <OrderStatusProgress
          orderId={order.id}
          status={order.status}
          showCancel
          deliveryReady={deliveryReady}
        />
      </div>

      <div className="mt-6 rounded-lg border bg-card p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Delivery &amp; tracking</h2>
            {deliveryReady ? (
              <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                Ready
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                Required before shipping
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            The customer uses the tracking number to follow the shipment.
          </p>
        </div>
        <div className="max-w-lg">
          <DeliveryForm
            action={updateDeliveryAction.bind(null, order.id)}
            initial={{
              courier: order.delivery.courier,
              trackingNumber: order.delivery.trackingNumber,
              trackingUrl: order.delivery.trackingUrl,
            }}
            orderStatus={order.status}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Items</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <Link
                          href={`/admin/products/${item.productId}/edit`}
                          className="font-medium hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
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
              <h2 className="mb-3 font-semibold">Customer &amp; payment</h2>
              <div className="text-sm text-muted-foreground">
                <p className="text-foreground">
                  {order.customer?.name ?? "Unknown"}
                </p>
                <p>{order.customer?.email ?? ""}</p>
                <p className="mt-2">
                  {order.paymentMethod === "cod"
                    ? "Cash on delivery"
                    : "Card (demo)"}
                </p>
              </div>
            </div>
          </div>

          {order.note ? (
            <div className="rounded-lg border bg-card p-5">
              <h2 className="mb-2 font-semibold">Customer note</h2>
              <p className="text-sm text-muted-foreground">{order.note}</p>
            </div>
          ) : null}
        </div>

        <aside className="flex h-fit flex-col gap-6">
          <div className="rounded-lg border bg-card p-5 text-sm">
            <h2 className="mb-3 font-semibold">Summary</h2>
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

          <div className="rounded-lg border border-destructive/40 bg-card p-5">
            <h2 className="mb-1 font-semibold text-destructive">Danger zone</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Deleting an order permanently removes it and any customer order
              history for it.
            </p>
            <ActionButton
              action={deleteOrderAction.bind(null, order.id)}
              confirmMessage={`Delete order ${order.orderNumber}? This cannot be undone.`}
              successMessage="Order deleted"
              redirectTo="/admin/orders"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-destructive px-3 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete order
            </ActionButton>
          </div>
        </aside>
      </div>
    </div>
  );
}
