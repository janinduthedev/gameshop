import { z } from "zod";
import { ORDER_STATUS } from "@/constants";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, { error: "Please enter your full name." }).trim(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  phone: z.string().min(7, { error: "Please enter a valid phone number." }).trim(),
  address: z.string().min(5, { error: "Please enter your address." }).trim(),
  city: z.string().min(2, { error: "Please enter your city." }).trim(),
  postalCode: z.string().min(3, { error: "Please enter a postal code." }).trim(),
  country: z.string().min(2, { error: "Please enter your country." }).trim(),
  paymentMethod: z.enum(["cod", "card"], {
    error: "Please select a payment method.",
  }),
  note: z.string().trim().optional().default(""),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(Object.values(ORDER_STATUS) as [string, ...string[]]),
});

export const deliverySchema = z.object({
  courier: z
    .string()
    .min(2, { error: "Enter the courier service name." })
    .max(60, { error: "Courier name must be 60 characters or fewer." })
    .trim(),
  trackingNumber: z
    .string()
    .min(4, { error: "Enter the tracking number." })
    .max(40, { error: "Tracking number must be 40 characters or fewer." })
    .regex(/^[A-Za-z0-9-]+$/, {
      error: "Use letters, numbers and dashes only.",
    })
    .trim(),
  trackingUrl: z
    .string()
    .trim()
    .optional()
    .default(""),
});

export type DeliveryInput = z.infer<typeof deliverySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
