import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .trim(),
  description: z.string().trim().optional().default(""),
  image: z.string().url().optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
