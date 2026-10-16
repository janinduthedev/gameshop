"use client";

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  size?: "default" | "sm" | "lg";
  className?: string;
  withIcon?: boolean;
  label?: string;
};

export function AddToCartButton({
  product,
  size = "default",
  className,
  withIcon = true,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const outOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      className={className}
      disabled={outOfStock}
      onClick={() => {
        if (!isAuthenticated) {
          toast.error("Please sign in to add items to your cart");
          router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        });
        toast.success(`${product.name} added to cart`);
      }}
    >
      {withIcon && <ShoppingCart className="h-4 w-4" />}
      {outOfStock ? "Out of stock" : label}
    </Button>
  );
}
