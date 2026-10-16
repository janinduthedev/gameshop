/**
 * Shared, app-wide constants.
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_STATUS_VALUES = Object.values(USER_STATUS) as UserStatus[];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const SUPPORT_STATUS = {
  OPEN: "open",
  RESOLVED: "resolved",
} as const;

export type SupportStatus = (typeof SUPPORT_STATUS)[keyof typeof SUPPORT_STATUS];

export const SUPPORT_STATUS_VALUES = Object.values(
  SUPPORT_STATUS,
) as SupportStatus[];

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  open: "Open",
  resolved: "Resolved",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS) as OrderStatus[];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PRODUCT_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name A-Z", value: "name-asc" },
] as const;

export const PRODUCT_SORT_VALUES = PRODUCT_SORT_OPTIONS.map((o) => o.value);

export const PRODUCTS_PER_PAGE = 12;

/** Products at or below this stock level surface as low-stock alerts. */
export const LOW_STOCK_THRESHOLD = 5;
