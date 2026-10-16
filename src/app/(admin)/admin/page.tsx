import Link from "next/link";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Tags,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AdminRecentOrdersList } from "@/components/admin/recent-orders-list";
import { getDashboardStats, getLowStockProducts } from "@/lib/queries";
import { LOW_STOCK_THRESHOLD } from "@/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, lowStock] = await Promise.all([
    getDashboardStats(),
    getLowStockProducts(),
  ]);

  const cards = [
    { label: "Revenue", value: formatCurrency(stats.revenue), icon: DollarSign },
    { label: "Orders", value: stats.orderCount, icon: ShoppingCart },
    { label: "Products", value: stats.productCount, icon: Package },
    { label: "Categories", value: stats.categoryCount, icon: Tags },
    { label: "Users", value: stats.userCount, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Overview of your store performance.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-2 text-xl font-semibold sm:text-2xl">{card.value}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-2 border-b border-amber-500/30 p-4 sm:p-5">
            <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" />
            <h2 className="font-semibold">
              Low stock alert ({lowStock.length})
            </h2>
          </div>
          <p className="px-4 pt-4 text-sm text-muted-foreground sm:px-5">
            These products have {LOW_STOCK_THRESHOLD} or fewer left in stock.
          </p>
          <div className="mt-3 divide-y divide-amber-500/20">
            {lowStock.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-amber-500/10 sm:px-5"
              >
                <span className="min-w-0 truncate font-medium">
                  {product.name}
                </span>
                <span
                  className={
                    product.stock <= 0
                      ? "shrink-0 text-sm font-semibold text-destructive"
                      : "shrink-0 text-sm font-semibold text-amber-600"
                  }
                >
                  {product.stock <= 0
                    ? "Out of stock"
                    : `${product.stock} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b p-4 sm:p-5">
          <h2 className="font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <AdminRecentOrdersList orders={stats.recentOrders} />
      </div>
    </div>
  );
}
