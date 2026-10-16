import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-2 text-muted-foreground">
        Browse our accessories by category.
      </p>

      {categories.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No categories yet.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/50"
            >
              <div className="relative aspect-video bg-muted">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {category.name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold group-hover:text-primary">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
