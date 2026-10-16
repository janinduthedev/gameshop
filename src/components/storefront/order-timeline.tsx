import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { ORDER_STATUS, ORDER_STATUS_LABELS, type OrderStatus } from "@/constants";
import { cn } from "@/lib/utils";

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: ORDER_STATUS.PENDING, label: "Order Placed", icon: Clock },
  { status: ORDER_STATUS.PROCESSING, label: "Processing", icon: Package },
  { status: ORDER_STATUS.SHIPPED, label: "Shipped", icon: Truck },
  { status: ORDER_STATUS.DELIVERED, label: "Delivered", icon: CheckCircle2 },
];

export function OrderTimeline({ status }: { status: string }) {
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <XCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Order Cancelled</p>
          <p className="text-xs text-destructive/80">
            This order has been cancelled and will not be shipped.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="w-full">
      <ol className="flex w-full items-center justify-between">
        {STEPS.map((step, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const Icon = step.icon;

          return (
            <li
              key={step.status}
              className={cn(
                "relative flex flex-1 flex-col items-center",
                idx !== STEPS.length - 1 &&
                  "after:absolute after:left-[50%] after:top-4 after:h-0.5 after:w-full after:-translate-y-1/2 after:content-['']",
                idx !== STEPS.length - 1 &&
                  (isDone
                    ? "after:bg-primary"
                    : "after:bg-border"),
              )}
            >
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isDone &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-background text-primary ring-4 ring-primary/20",
                  !isDone &&
                    !isCurrent &&
                    "border-muted bg-muted/30 text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-center text-xs font-medium",
                  isCurrent ? "text-foreground font-semibold" : isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
