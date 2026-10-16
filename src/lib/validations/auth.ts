import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(6, { error: "Password must be at least 6 characters." }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { error: "Name must be at least 2 characters." })
      .trim(),
    email: z.email({ error: "Please enter a valid email address." }).trim(),
    password: z
      .string()
      .min(6, { error: "Password must be at least 6 characters." })
      .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
      .regex(/[0-9]/, { error: "Password must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
