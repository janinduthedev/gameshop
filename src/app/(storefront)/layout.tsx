import { getSession } from "@/lib/dal";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AuthProvider isAuthenticated={Boolean(session?.user)}>
      <CartProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
