"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusProgress } from "@/components/admin/order-status-progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderDTO } from "@/lib/queries";

const NEW_ORDER_IDS_KEY = "gamestore_new_unviewed_order_ids";

export function AdminOrdersTable({ orders }: { orders: OrderDTO[] }) {
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
    return <p className="p-6 text-sm text-muted-foreground">No orders found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Manage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const isNew = newOrderIds.has(order.id);

          return (
            <TableRow
              key={order.id}
              className={
                isNew
                  ? "bg-primary/10 border-l-4 border-l-primary hover:bg-primary/15 transition-colors"
                  : undefined
              }
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{order.orderNumber}</span>
                  {isNew && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm animate-pulse">
                      <Sparkles className="h-2.5 w-2.5" /> NEW
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{order.customer?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer?.email ?? ""}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
              <TableCell className="font-semibold text-sm">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <OrderStatusProgress
                  orderId={order.id}
                  status={order.status}
                  size="sm"
                  deliveryReady={Boolean(
                    order.delivery.courier.trim() &&
                      order.delivery.trackingNumber.trim(),
                  )}
                />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/orders/${order.id}`}
                  onClick={() => handleMarkViewed(order.id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Manage
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
