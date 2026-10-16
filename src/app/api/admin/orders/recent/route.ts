import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models";
import { getSession } from "@/lib/dal";
import { ROLES } from "@/constants";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (since) {
    const sinceDate = new Date(since);
    if (!isNaN(sinceDate.getTime())) {
      query.createdAt = { $gt: sinceDate };
    }
  }

  const recentOrders = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const formatted = recentOrders.map((o) => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    customerName:
      o.user && typeof o.user === "object" && "name" in o.user
        ? o.user.name
        : o.shipping?.fullName || "Customer",
    total: o.total,
    itemCount: o.items?.length || 0,
    status: o.status,
    createdAt: new Date(o.createdAt).toISOString(),
  }));

  return NextResponse.json({
    orders: formatted,
    serverTime: new Date().toISOString(),
  });
}
