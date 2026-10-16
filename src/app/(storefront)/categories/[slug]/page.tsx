import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products, total } = await getProducts({ category: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/categories"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All categories
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      )}
      <p className="mt-1 text-sm text-muted-foreground">{total} items</p>

      {products.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No products in this category yet.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
