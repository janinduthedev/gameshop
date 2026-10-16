import { z } from "zod";
import { USER_STATUS } from "@/constants";

export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .trim(),
  email: z.email({ error: "Please enter a valid email address." }).trim(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(Object.values(USER_STATUS) as [string, ...string[]]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Current password is required." }),
    newPassword: z
      .string()
      .min(6, { error: "New password must be at least 6 characters." })
      .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
      .regex(/[0-9]/, { error: "Password must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "New passwords do not match.",
    path: ["confirmPassword"],
  });

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

