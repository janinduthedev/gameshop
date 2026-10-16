"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Category, Product } from "@/models";
import { categorySchema } from "@/lib/validations/category";
import { deleteImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/dal";
import { slugify } from "@/lib/utils";
import type { FormState } from "@/types";

export async function createCategoryAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, description, image } = parsed.data;
  const imagePublicId = String(formData.get("imagePublicId") ?? "");
  await connectToDatabase();

  const slug = slugify(name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    return { message: "A category with this name already exists." };
  }

  await Category.create({
    name,
    slug,
    description,
    image: image || "",
    imagePublicId,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true, message: "Category created." };
}

export async function updateCategoryAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, description, image } = parsed.data;
  const imagePublicId = String(formData.get("imagePublicId") ?? "");
  await connectToDatabase();

  const existing = await Category.findById(id);
  if (!existing) {
    return { message: "Category not found." };
  }

  const newSlug = slugify(name);
  const duplicate = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
  if (duplicate) {
    return { message: "A category with this name already exists." };
  }

  if (existing.imagePublicId && existing.imagePublicId !== imagePublicId) {
    await deleteImage(existing.imagePublicId).catch(() => {});
  }

  await Category.findByIdAndUpdate(id, {
    name,
    slug: newSlug,
    description,
    image: image || "",
    imagePublicId,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true, message: "Category updated." };
}

export async function deleteCategoryAction(id: string): Promise<FormState> {
  await requireAdmin();
  await connectToDatabase();

  const productsInCategory = await Product.countDocuments({ category: id });
  if (productsInCategory > 0) {
    return {
      message: "Cannot delete a category that still has products.",
    };
  }

  const category = await Category.findById(id);
  if (category?.imagePublicId) {
    await deleteImage(category.imagePublicId).catch(() => {});
  }

  await Category.findByIdAndDelete(id);
  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true, message: "Category deleted." };
}
