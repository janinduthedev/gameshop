import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/actions/product";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to products
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">New product</h1>

      {categories.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          You need at least one category before creating a product.{" "}
          <Link href="/admin/categories" className="text-primary hover:underline">
            Create a category
          </Link>
          .
        </p>
      ) : (
        <ProductForm action={createProductAction} categories={categories} />
      )}
    </div>
  );
}
