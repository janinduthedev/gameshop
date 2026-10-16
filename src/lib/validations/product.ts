import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters." })
    .trim(),
  description: z
    .string()
    .min(10, { error: "Description must be at least 10 characters." })
    .trim(),
  price: z.coerce
    .number({ error: "Price must be a number." })
    .positive({ error: "Price must be greater than 0." }),
  compareAtPrice: z.coerce
    .number()
    .nonnegative({ error: "Compare price cannot be negative." })
    .optional(),
  stock: z.coerce
    .number({ error: "Stock must be a number." })
    .int({ error: "Stock must be a whole number." })
    .nonnegative({ error: "Stock cannot be negative." }),
  category: z.string().min(1, { error: "Please select a category." }),
  brand: z.string().trim().optional().default(""),
  featured: z.coerce.boolean().optional().default(false),
  images: z
    .array(z.string().url())
    .min(1, { error: "Please upload at least one image." }),
});

export type ProductInput = z.infer<typeof productSchema>;
