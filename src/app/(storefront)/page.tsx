import Link from "next/link";
import { ArrowRight, Gamepad2, Headphones, Keyboard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { getCategories, getFeaturedProducts, getLatestProducts } from "@/lib/queries";

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedProducts(4),
    getLatestProducts(8),
    getCategories(),
  ]);

  const highlights = [
    {
      icon: Gamepad2,
      title: "Top-tier gear",
      description: "Controllers and accessories from trusted brands.",
    },
    {
      icon: Headphones,
      title: "Immersive audio",
      description: "Headsets built for competitive edge and comfort.",
    },
    {
      icon: Keyboard,
      title: "Precision input",
      description: "Mechanical keyboards and pro-grade mice.",
    },
    {
      icon: Truck,
      title: "Fast shipping",
      description: "Free delivery on orders over $100.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
          <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Upgrade your setup
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
            Gear up for your next win
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Discover premium gaming accessories — controllers, headsets,
            keyboards and everything in between.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products">
              <Button size="lg" className="gap-2">
                Shop now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline">
                Browse categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-lg border bg-card p-5">
              <item.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shop by category</h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-full border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">New arrivals</h2>
            <Link
              href="/products"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {latest.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-muted-foreground">
            No products yet.{" "}
            <Link href="/admin/products/new" className="text-primary hover:underline">
              Add your first product
            </Link>{" "}
            as an admin.
          </p>
        </section>
      )}
    </div>
  );
}
