import { CartView } from "@/components/storefront/cart-view";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Your cart</h1>
      <CartView />
    </div>
  );
}
