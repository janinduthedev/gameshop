import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ProductDTO } from "@/lib/queries";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: ProductDTO }) {
  const image = product.images[0]?.url;
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/50">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {product.featured && (
          <Badge className="absolute left-2 top-2">Featured</Badge>
        )}
        {onSale && (
          <Badge variant="destructive" className="absolute right-2 top-2">
            Sale
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-1 font-medium hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold">
            {formatCurrency(product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <div className="mt-auto pt-2">
          <AddToCartButton
            size="sm"
            className="w-full"
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: image ?? "",
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
