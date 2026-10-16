import Link from "next/link";
import { Search, Truck, ArrowLeft, CheckCircle2, Clock, Package, ExternalLink } from "lucide-react";
import { getOrderByTrackingNumber } from "@/lib/queries";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Track your shipment",
  description: "Track your GameStore package and shipping status.",
};

type TrackPageProps = {
  searchParams: Promise<{ number?: string }>;
};

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const { number } = await searchParams;
  const trackingNumber = number?.trim() ?? "";

  const order = trackingNumber
    ? await getOrderByTrackingNumber(trackingNumber)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my account
      </Link>

      <div className="mt-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Truck className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Track Your Shipment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your courier tracking number to see the current shipping progress.
        </p>
      </div>

      <form
        method="GET"
        action="/track"
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="number"
            defaultValue={trackingNumber}
            placeholder="Enter tracking number (e.g. DXM123456789)"
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" className="gap-2">
          <Truck className="h-4 w-4" />
          Track
        </Button>
      </form>

      {trackingNumber ? (
        <div className="mt-10">
          {order ? (
            <div className="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Order Number
                  </span>
                  <p className="text-lg font-bold">{order.orderNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Courier Partner
                  </span>
                  <p className="font-semibold text-primary">{order.courier || "Standard Courier"}</p>
                  {order.trackingUrl ? (
                    <a
                      href={
                        order.trackingUrl.includes("{trackingNumber}")
                          ? order.trackingUrl.replace(
                              "{trackingNumber}",
                              encodeURIComponent(order.trackingNumber),
                            )
                          : order.trackingUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View on {order.courier || "Courier"} portal <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="py-4">
                <span className="mb-6 block text-xs uppercase tracking-wide text-muted-foreground">
                  Shipment Progress
                </span>
                <OrderTimeline status={order.status} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-muted/40 p-4 text-xs text-muted-foreground">
                <div>
                  <span>Tracking code: </span>
                  <span className="font-mono font-medium text-foreground">
                    {order.trackingNumber}
                  </span>
                </div>
                <div>
                  <span>Last status update: </span>
                  <span className="font-medium text-foreground">
                    {formatDate(order.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 font-semibold">Shipment not found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No order found matching tracking number{" "}
                <span className="font-mono font-medium text-foreground">&quot;{trackingNumber}&quot;</span>.
                Please check the number and try again.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
