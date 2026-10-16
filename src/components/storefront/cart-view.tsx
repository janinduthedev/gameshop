"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/cart-context";

const FREE_SHIPPING_THRESHOLD = 100;

export function CartView() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center sm:py-24">
        <ShoppingBag className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
        <h2 className="text-lg font-semibold sm:text-xl">
          Your cart is empty
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const total = subtotal + shippingFee;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        {items.map((item) => {
          const lineTotal = item.price * item.quantity;

          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-lg border bg-card p-3 sm:gap-4 sm:p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 64px, 96px"
                    className="object-contain"
                  />
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      className="line-clamp-2 text-sm font-medium hover:text-primary sm:line-clamp-1 sm:text-base"
                    >
                      {item.name}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
                      {formatCurrency(item.price)} each
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold sm:hidden">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <div className="flex items-center rounded-md border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="flex h-9 w-9 items-center justify-center hover:bg-accent sm:h-8 sm:w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="flex h-9 w-9 items-center justify-center hover:bg-accent sm:h-8 sm:w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-sm text-destructive hover:underline"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                    <span className="hidden text-sm font-semibold sm:inline">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="h-fit rounded-lg border bg-card p-4 sm:p-6 lg:sticky lg:top-24">
        <h2 className="text-base font-semibold sm:text-lg">Order summary</h2>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full" size="lg">
            Proceed to checkout
          </Button>
        </Link>
      </aside>
    </div>
  );
}
