"use client";

import { useActionState, useEffect } from "react";
import { Ban, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/order";
import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/constants";
import { cn } from "@/lib/utils";
import type { FormState } from "@/types";

const LIFECYCLE: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

type OrderStatusProgressProps = {
  orderId: string;
  status: string;
  size?: "default" | "sm";
  showCancel?: boolean;
  deliveryReady?: boolean;
};

export function OrderStatusProgress({
  orderId,
  status,
  size = "default",
  showCancel = false,
  deliveryReady = true,
}: OrderStatusProgressProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateOrderStatusAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Updated");
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  const currentIndex =
    status === ORDER_STATUS.CANCELLED
      ? -1
      : LIFECYCLE.indexOf(status as OrderStatus);
  const isCancelled = status === ORDER_STATUS.CANCELLED;
  const compact = size === "sm";

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="orderId" value={orderId} />

      {isCancelled && (
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="destructive">Cancelled</Badge>
          {!showCancel && (
            <span className="text-xs text-muted-foreground">
              Click a step to reopen
            </span>
          )}
        </div>
      )}

      <ol
        className={cn("flex items-start", compact && "min-w-[220px]")}
        aria-label="Order lifecycle"
      >
        {LIFECYCLE.map((step, index) => {
          const reached = currentIndex >= 0 && index <= currentIndex;
          const isCurrent = index === currentIndex;
          const needsDelivery =
            step === ORDER_STATUS.SHIPPED || step === ORDER_STATUS.DELIVERED;
          const blocked = needsDelivery && !deliveryReady;

          return (
            <li
              key={step}
              className="relative flex flex-1 flex-col items-center gap-1.5"
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-1/2 h-0.5 w-full",
                    compact ? "top-[9px]" : "top-[13px]",
                    reached ? "bg-emerald-600" : "bg-border",
                  )}
                />
              )}
              <button
                type="submit"
                name="status"
                value={step}
                title={
                  blocked
                    ? "Add a courier service and tracking number first"
                    : `Mark as ${ORDER_STATUS_LABELS[step]}`
                }
                aria-label={`Mark order as ${ORDER_STATUS_LABELS[step]}`}
                disabled={pending || blocked}
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed",
                  compact ? "h-5 w-5" : "h-7 w-7",
                  blocked
                    ? "border-border bg-muted text-muted-foreground/50"
                    : reached
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border bg-background text-muted-foreground hover:border-emerald-600 hover:text-emerald-600",
                  pending && "opacity-60",
                )}
              >
                {reached ? (
                  <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
                ) : (
                  <span className={compact ? "text-[9px]" : "text-[10px]"}>
                    {index + 1}
                  </span>
                )}
              </button>
              <span
                className={cn(
                  "text-center leading-tight",
                  compact ? "text-[10px]" : "text-xs",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {ORDER_STATUS_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>

      {showCancel && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-3">
          {isCancelled ? (
            <button
              type="submit"
              name="status"
              value={ORDER_STATUS.PENDING}
              disabled={pending}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen order
            </button>
          ) : (
            <button
              type="submit"
              name="status"
              value={ORDER_STATUS.CANCELLED}
              disabled={pending}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/40 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel order
            </button>
          )}
          <span
            className={cn(
              "text-xs",
              !deliveryReady && !isCancelled
                ? "text-amber-600"
                : "text-muted-foreground",
            )}
          >
            {isCancelled
              ? "Cancelled orders can be reopened from any step."
              : !deliveryReady
                ? "Add a courier service and tracking number below before shipping."
                : "Changes save instantly."}
          </span>
        </div>
      )}
    </form>
  );
}
