"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import type { CategoryDTO } from "@/lib/queries";
import type { FormState } from "@/types";

type ProductFormProps = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  categories: CategoryDTO[];
  initial?: {
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    category: string;
    brand: string;
    featured: boolean;
    images: UploadedImage[];
  };
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function ProductForm({ action, categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Saved");
      router.push("/admin/products");
      router.refresh();
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <section className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="mb-4 font-semibold">Details</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={initial?.name} required />
              <FieldError errors={state?.errors?.name} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={initial?.description}
                required
              />
              <FieldError errors={state?.errors?.description} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={initial?.price}
                  required
                />
                <FieldError errors={state?.errors?.price} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="compareAtPrice">Compare at price ($)</Label>
                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={initial?.compareAtPrice ?? ""}
                  placeholder="Optional"
                />
                <FieldError errors={state?.errors?.compareAtPrice} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="mb-4 font-semibold">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
          <FieldError errors={state?.errors?.images} />
          <p className="mt-2 text-xs text-muted-foreground">
            Uploaded to Cloudinary. First image is the main one.
          </p>
        </section>
      </div>

      <aside className="flex h-fit flex-col gap-6">
        <section className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="mb-4 font-semibold">Organisation</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue={initial?.category ?? ""}
                required
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError errors={state?.errors?.category} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" defaultValue={initial?.brand} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={initial?.stock ?? 0}
                required
              />
              <FieldError errors={state?.errors?.stock} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initial?.featured}
                className="h-4 w-4 accent-primary"
              />
              Featured product
            </label>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving..." : initial ? "Update product" : "Create product"}
        </Button>
      </aside>
    </form>
  );
}
