import { CheckoutForm } from "@/components/storefront/checkout-form";
import { requireUser } from "@/lib/dal";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <CheckoutForm
        defaultName={user.name ?? ""}
        defaultEmail={user.email ?? ""}
      />
    </div>
  );
}
