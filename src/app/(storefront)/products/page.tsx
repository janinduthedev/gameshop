import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { getCategories, getProducts } from "@/lib/queries";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ products, totalPages, total }, categories] = await Promise.all([
    getProducts({
      search: params.search,
      category: params.category,
      sort: params.sort,
      page,
    }),
    getCategories(),
  ]);

  function pageLink(targetPage: number) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.sort) query.set("sort", params.sort);
    query.set("page", String(targetPage));
    return `/products?${query.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <span className="text-sm text-muted-foreground">{total} items</span>
      </div>

      <div className="mt-6">
        <ProductFilters categories={categories} />
      </div>

      {products.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No products found. Try a different search.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => {
            const targetPage = index + 1;
            const active = targetPage === page;
            return (
              <Link
                key={targetPage}
                href={pageLink(targetPage)}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {targetPage}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
