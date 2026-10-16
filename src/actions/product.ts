"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models";
import { productSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/dal";
import { slugify } from "@/lib/utils";
import type { FormState } from "@/types";

function parseForm(formData: FormData) {
  const images = formData.getAll("images").map(String).filter(Boolean);
  const publicIds = formData.getAll("publicIds").map(String);

  return {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    stock: formData.get("stock"),
    category: formData.get("category"),
    brand: formData.get("brand") || "",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    images,
    publicIds,
  };
}

export async function createProductAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = parseForm(formData);
  const parsed = productSchema.safeParse({
    name: raw.name,
    description: raw.description,
    price: raw.price,
    compareAtPrice: raw.compareAtPrice,
    stock: raw.stock,
    category: raw.category,
    brand: raw.brand,
    featured: raw.featured,
    images: raw.images,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await connectToDatabase();

  const data = parsed.data;
  await Product.create({
    ...data,
    slug: `${slugify(data.name)}-${Date.now().toString(36)}`,
    images: data.images.map((url, index) => ({
      url,
      publicId: raw.publicIds[index] ?? "",
    })),
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true, message: "Product created." };
}

export async function updateProductAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = parseForm(formData);
  const parsed = productSchema.safeParse({
    name: raw.name,
    description: raw.description,
    price: raw.price,
    compareAtPrice: raw.compareAtPrice,
    stock: raw.stock,
    category: raw.category,
    brand: raw.brand,
    featured: raw.featured,
    images: raw.images,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await connectToDatabase();

  const data = parsed.data;
  await Product.findByIdAndUpdate(id, {
    ...data,
    images: data.images.map((url, index) => ({
      url,
      publicId: raw.publicIds[index] ?? "",
    })),
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);

  return { success: true, message: "Product updated." };
}

export async function deleteProductAction(id: string): Promise<FormState> {
  await requireAdmin();
  await connectToDatabase();

  await Product.findByIdAndDelete(id);

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true, message: "Product deleted." };
}
