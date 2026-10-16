import { z } from "zod";
import { SUPPORT_STATUS } from "@/constants";

export const supportMessageSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .trim(),
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  subject: z
    .string()
    .min(3, { error: "Subject must be at least 3 characters." })
    .max(120, { error: "Subject must be 120 characters or fewer." })
    .trim(),
  message: z
    .string()
    .min(10, { error: "Message must be at least 10 characters." })
    .max(2000, { error: "Message must be 2000 characters or fewer." })
    .trim(),
});

export const updateSupportStatusSchema = z.object({
  status: z.enum(Object.values(SUPPORT_STATUS) as [string, ...string[]]),
});

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;
