"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { createOrderAction } from "@/actions/order";
import { useCart } from "@/context/cart-context";
import type { FormState } from "@/types";

type CheckoutFormProps = {
  defaultName: string;
  defaultEmail: string;
};

export function CheckoutForm({ defaultName, defaultEmail }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createOrderAction,
    null,
  );

  useEffect(() => {
    if (state?.success && state.orderId) {
      clearCart();
      toast.success("Order placed!");
      router.push(`/account/orders/${state.orderId}`);
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  const shippingFee = subtotal >= 100 ? 0 : 9.99;

  const cartPayload = JSON.stringify(
    items.map((item) => ({ productId: item.id, quantity: item.quantity })),
  );

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="items" value={cartPayload} />

      <div className="flex flex-col gap-6">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Shipping details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={defaultName} required />
              <FieldError errors={state?.errors?.fullName} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultEmail}
                required
              />
              <FieldError errors={state?.errors?.email} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required />
              <FieldError errors={state?.errors?.phone} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue="Sri Lanka" required />
              <FieldError errors={state?.errors?.country} />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required />
              <FieldError errors={state?.errors?.address} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
              <FieldError errors={state?.errors?.city} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" name="postalCode" required />
              <FieldError errors={state?.errors?.postalCode} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Payment</h2>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 rounded-md border p-3">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                defaultChecked
                className="accent-primary"
              />
              <span className="text-sm">Cash on delivery</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border p-3">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                className="accent-primary"
              />
              <span className="text-sm">Card (demo — no real charge)</span>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="note">Order note (optional)</Label>
            <Textarea id="note" name="note" rows={3} />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(subtotal + shippingFee)}</span>
          </div>
        </div>
        <Button type="submit" className="mt-6 w-full" size="lg" disabled={pending}>
          {pending ? "Placing order..." : "Place order"}
        </Button>
      </aside>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
