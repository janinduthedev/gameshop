"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderDTO } from "@/lib/queries";

const NEW_ORDER_IDS_KEY = "gamestore_new_unviewed_order_ids";

export function AdminRecentOrdersList({ orders }: { orders: OrderDTO[] }) {
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    function loadNewIds() {
      try {
        const stored = localStorage.getItem(NEW_ORDER_IDS_KEY);
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          setNewOrderIds(new Set(ids));
        }
      } catch {
        // ignore
      }
    }

    loadNewIds();

    window.addEventListener("gamestore:new_orders_updated", loadNewIds);
    return () => {
      window.removeEventListener("gamestore:new_orders_updated", loadNewIds);
    };
  }, []);

  function handleMarkViewed(orderId: string) {
    try {
      const stored = localStorage.getItem(NEW_ORDER_IDS_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const filtered = ids.filter((id) => id !== orderId);
        localStorage.setItem(NEW_ORDER_IDS_KEY, JSON.stringify(filtered));
        setNewOrderIds(new Set(filtered));
      }
    } catch {
      // ignore
    }
  }

  if (orders.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground sm:p-5">No orders yet.</p>;
  }

  return (
    <div className="divide-y">
      {orders.map((order) => {
        const isNew = newOrderIds.has(order.id);

        return (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            onClick={() => handleMarkViewed(order.id)}
            className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5 transition-colors ${
              isNew
                ? "bg-primary/10 border-l-4 border-l-primary hover:bg-primary/15"
                : "hover:bg-muted/30"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{order.orderNumber}</p>
                {isNew && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm animate-pulse">
                    <Sparkles className="h-2.5 w-2.5" /> NEW
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {order.customer?.name ?? "Unknown"} · {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <OrderStatusBadge status={order.status} />
              <span className="font-semibold">{formatCurrency(order.total)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
