"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Order, Product } from "@/models";
import { checkoutSchema, deliverySchema, updateOrderStatusSchema } from "@/lib/validations/order";
import { requireUser, requireAdmin } from "@/lib/dal";
import { generateOrderNumber } from "@/lib/utils";
import { ORDER_STATUS } from "@/constants";
import type { FormState } from "@/types";

type CartLine = {
  productId: string;
  quantity: number;
};

const SHIPPING_FEE = 9.99;
const FREE_SHIPPING_THRESHOLD = 100;

export async function createOrderAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    paymentMethod: formData.get("paymentMethod"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let lines: CartLine[] = [];
  try {
    lines = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { message: "Your cart is invalid. Please try again." };
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    return { message: "Your cart is empty." };
  }

  await connectToDatabase();

  const orderItems = [];
  let subtotal = 0;

  for (const line of lines) {
    const product = await Product.findById(line.productId);
    if (!product) {
      return { message: "A product in your cart no longer exists." };
    }
    if (product.stock < line.quantity) {
      return {
        message: `Not enough stock for "${product.name}". Only ${product.stock} left.`,
      };
    }

    const price = product.price;
    subtotal += price * line.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price,
      quantity: line.quantity,
    });
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: user.id,
    items: orderItems,
    shipping: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
    },
    paymentMethod: parsed.data.paymentMethod,
    note: parsed.data.note,
    subtotal,
    shippingFee,
    total,
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account");

  return {
    success: true,
    message: "Order placed successfully.",
    orderId: order._id.toString(),
  };
}

export async function updateOrderStatusAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { message: "Invalid status update." };
  }

  if (!/^[0-9a-fA-F]{24}$/.test(parsed.data.orderId)) {
    return { message: "Invalid order." };
  }

  await connectToDatabase();

  const existing = await Order.findById(parsed.data.orderId)
    .select("delivery")
    .lean();

  if (!existing) {
    return { message: "Order not found." };
  }

  const requiresDelivery =
    parsed.data.status === ORDER_STATUS.SHIPPED ||
    parsed.data.status === ORDER_STATUS.DELIVERED;

  if (
    requiresDelivery &&
    (!existing.delivery?.courier?.trim() ||
      !existing.delivery?.trackingNumber?.trim())
  ) {
    return {
      message:
        "Add the courier service and tracking number before marking this order as shipped.",
    };
  }

  const updated = await Order.findByIdAndUpdate(parsed.data.orderId, {
    status: parsed.data.status,
  });

  if (!updated) {
    return { message: "Order not found." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/account");

  return { success: true, message: "Order status updated." };
}

export async function updateDeliveryAction(
  orderId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
    return { message: "Invalid order." };
  }

  const parsed = deliverySchema.safeParse({
    courier: formData.get("courier"),
    trackingNumber: formData.get("trackingNumber"),
    trackingUrl: formData.get("trackingUrl"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const markDelivered = formData.get("markDelivered") === "true";

  await connectToDatabase();

  const updatePayload: Record<string, unknown> = {
    delivery: {
      courier: parsed.data.courier,
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl: parsed.data.trackingUrl ?? "",
    },
  };

  if (markDelivered) {
    updatePayload.status = ORDER_STATUS.DELIVERED;
  }

  const updated = await Order.findByIdAndUpdate(orderId, updatePayload);

  if (!updated) {
    return { message: "Order not found." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  revalidatePath("/track");

  return {
    success: true,
    message: markDelivered
      ? "Delivery details saved and order marked as Delivered."
      : "Delivery details saved.",
  };
}

export async function deleteOrderAction(orderId: string): Promise<FormState> {
  await requireAdmin();

  if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
    return { message: "Invalid order." };
  }

  await connectToDatabase();
  const deleted = await Order.findByIdAndDelete(orderId);

  if (!deleted) {
    return { message: "Order not found." };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account");

  return { success: true, message: "Order deleted." };
}
