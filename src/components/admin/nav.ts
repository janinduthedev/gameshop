import {
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Package,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: Tags },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Support", href: "/admin/support", icon: LifeBuoy },
  { title: "Settings", href: "/admin/settings", icon: KeyRound },
];

