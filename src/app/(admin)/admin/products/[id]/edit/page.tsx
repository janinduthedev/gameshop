import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "@/actions/product";
import { getCategories, getProduct } from "@/lib/queries";

export const metadata = { title: "Edit product" };

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to products
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Edit product</h1>

      <ProductForm
        action={updateProductAction.bind(null, id)}
        categories={categories}
        initial={{
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          category: product.category?.id ?? "",
          brand: product.brand,
          featured: product.featured,
          images: product.images,
        }}
      />
    </div>
  );
}
