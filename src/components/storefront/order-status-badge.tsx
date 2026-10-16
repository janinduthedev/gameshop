import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/constants";

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "success"
> = {
  pending: "secondary",
  processing: "default",
  shipped: "outline",
  delivered: "success",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariants[status] ?? "secondary"}>
      {ORDER_STATUS_LABELS[status as OrderStatus] ?? status}
    </Badge>
  );
}
