"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import type { ProductDTO } from "@/lib/queries";

export function ProductDetail({ product }: { product: ProductDTO }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const image = product.images[activeImage]?.url;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url ?? "",
        stock: product.stock,
      },
      quantity,
    );
    toast.success(`${quantity} × ${product.name} added to cart`);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {product.images.map((img, index) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`relative h-20 w-20 overflow-hidden rounded-md border ${
                  index === activeImage ? "border-primary" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        {product.category && (
          <span className="text-sm uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </span>
        )}
        <h1 className="text-3xl font-bold">{product.name}</h1>

        {product.brand && (
          <p className="text-sm text-muted-foreground">Brand: {product.brand}</p>
        )}

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold">
            {formatCurrency(product.price)}
          </span>
          {onSale && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
          {onSale && <Badge variant="destructive">Sale</Badge>}
        </div>

        <div>
          {outOfStock ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : (
            <Badge variant="success">In stock ({product.stock})</Badge>
          )}
        </div>

        <p className="leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {!outOfStock && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center hover:bg-accent"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center hover:bg-accent"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button className="gap-2" size="lg" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
