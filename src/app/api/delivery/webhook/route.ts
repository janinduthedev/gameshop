import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models";
import { ORDER_STATUS } from "@/constants";

/**
 * Automated Webhook for Courier Services.
 *
 * Courier partners (or their automated systems) make an HTTP POST request to this endpoint
 * when a package status changes or when it is delivered to the customer.
 *
 * Authentication:
 * Pass the secret in either:
 * - Header: `x-courier-secret`
 * - Authorization header: `Bearer <secret>`
 * - Query parameter: `?secret=<secret>`
 *
 * Payload JSON:
 * {
 *   "trackingNumber": "DXM123456789",
 *   "status": "delivered",             // "delivered" | "shipped" | "processing"
 *   "courier": "Domex",                // optional
 *   "trackingUrl": "https://..."       // optional
 * }
 */
export async function POST(req: Request) {
  try {
    const configuredSecret = process.env.COURIER_WEBHOOK_SECRET;

    // Check security secret if configured in environment
    if (configuredSecret) {
      const { searchParams } = new URL(req.url);
      const querySecret = searchParams.get("secret");
      const headerSecret = req.headers.get("x-courier-secret");
      const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

      const providedSecret = headerSecret || authHeader || querySecret;
      if (providedSecret !== configuredSecret) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid courier secret" },
          { status: 401 },
        );
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const trackingNumber = String(body.trackingNumber ?? "").trim();
    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Missing required field: trackingNumber" },
        { status: 400 },
      );
    }

    // Status can be specified, defaults to "delivered"
    const rawStatus = String(body.status ?? "delivered").toLowerCase().trim();
    const validStatuses = Object.values(ORDER_STATUS) as string[];

    const newStatus = validStatuses.includes(rawStatus)
      ? rawStatus
      : ORDER_STATUS.DELIVERED;

    await connectToDatabase();

    // Find the order with matching tracking number (case-insensitive)
    const escaped = trackingNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const order = await Order.findOne({
      "delivery.trackingNumber": { $regex: `^${escaped}$`, $options: "i" },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
          message: `No order found with tracking number '${trackingNumber}'`,
        },
        { status: 404 },
      );
    }

    // Update status
    order.status = newStatus;

    // Optionally update courier name or trackingUrl if provided
    if (body.courier && typeof body.courier === "string") {
      order.delivery.courier = body.courier.trim();
    }
    if (body.trackingUrl && typeof body.trackingUrl === "string") {
      order.delivery.trackingUrl = body.trackingUrl.trim();
    }

    await order.save();

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order._id.toString()}`);
    revalidatePath("/account");
    revalidatePath("/track");

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} updated to status '${newStatus}'.`,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        courier: order.delivery?.courier,
        trackingNumber: order.delivery?.trackingNumber,
      },
    });
  } catch (err) {
    console.error("Courier webhook error:", err);
    return NextResponse.json(
      { error: "Internal server error processing courier webhook" },
      { status: 500 },
    );
  }
}
