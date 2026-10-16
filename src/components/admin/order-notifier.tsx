"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ShoppingBag, X, Sparkles, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export type NewOrderInfo = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  status: string;
  createdAt: string;
};

const STORAGE_KEY = "gamestore_last_seen_order_time";
const NEW_ORDER_IDS_KEY = "gamestore_new_unviewed_order_ids";

export function AdminOrderNotifier() {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState<NewOrderInfo[]>([]);
  const lastCheckTimeRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Initialize last seen time from localStorage, or default to current time
    const savedTime = localStorage.getItem(STORAGE_KEY);
    if (savedTime) {
      lastCheckTimeRef.current = savedTime;
    } else {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, now);
      lastCheckTimeRef.current = now;
    }

    async function checkForNewOrders() {
      try {
        const since = lastCheckTimeRef.current;
        const res = await fetch(
          `/api/admin/orders/recent${since ? `?since=${encodeURIComponent(since)}` : ""}`,
        );
        if (!res.ok) return;

        const data = await res.json();
        const incomingOrders: NewOrderInfo[] = data.orders || [];

        if (incomingOrders.length > 0) {
          // Accumulate orders into modal list (newest first, deduped)
          setNewOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const fresh = incomingOrders.filter((o) => !existingIds.has(o.id));
            return [...fresh, ...prev];
          });

          // Save new order IDs in localStorage for highlighting in table/dashboard
          try {
            const existingSavedIds: string[] = JSON.parse(
              localStorage.getItem(NEW_ORDER_IDS_KEY) || "[]",
            );
            const combined = Array.from(
              new Set([...existingSavedIds, ...incomingOrders.map((o) => o.id)]),
            );
            localStorage.setItem(NEW_ORDER_IDS_KEY, JSON.stringify(combined));
            window.dispatchEvent(new Event("gamestore:new_orders_updated"));
          } catch {
            // ignore
          }

          // Refresh current page data so dashboard & tables show the new orders
          router.refresh();

          // Advance latest seen timestamp
          const newestTime = incomingOrders[0].createdAt;
          localStorage.setItem(STORAGE_KEY, newestTime);
          lastCheckTimeRef.current = newestTime;
        } else if (data.serverTime) {
          if (!lastCheckTimeRef.current) {
            lastCheckTimeRef.current = data.serverTime;
            localStorage.setItem(STORAGE_KEY, data.serverTime);
          }
        }
      } catch {
        // Silently catch network blips
      }
    }

    // Initial check on login/page load
    checkForNewOrders();

    // Poll every 10 seconds while admin is in the dashboard
    const interval = setInterval(checkForNewOrders, 10000);

    return () => clearInterval(interval);
  }, [router]);

  function handleDismissAll() {
    setNewOrders([]);
  }

  function handleDismissSingle(orderId: string) {
    setNewOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  if (newOrders.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-primary/30 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={handleDismissAll}
          aria-label="Close all notifications"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Bell className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                {newOrders.length === 1 ? "1 New Order!" : `${newOrders.length} New Orders!`}
              </span>
            </div>
            <h3 className="mt-1 text-xl font-bold">
              {newOrders.length === 1
                ? `Order ${newOrders[0].orderNumber}`
                : "Multiple Orders Received"}
            </h3>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {newOrders.length === 1
            ? "A customer just placed a new order."
            : `Customers placed ${newOrders.length} new orders while you were away.`}
        </p>

        {/* Scrollable list of new orders */}
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {newOrders.map((order) => (
            <div
              key={order.id}
              className="group relative rounded-lg border border-primary/20 bg-primary/5 p-3.5 transition-all hover:border-primary/40 hover:bg-primary/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {order.orderNumber}
                    </span>
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      NEW
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Customer: <span className="font-medium text-foreground">{order.customerName}</span> · {order.itemCount} item(s)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Placed: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-primary">
                    {formatCurrency(order.total)}
                  </span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    onClick={() => handleDismissSingle(order.id)}
                    className="mt-1.5 inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    View <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <button
            type="button"
            onClick={handleDismissAll}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Dismiss all
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              onClick={handleDismissAll}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              View All in Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
