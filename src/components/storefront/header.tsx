import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { CartButton } from "./cart-button";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export async function Header() {
  const session = await getSession();

  const user = session?.user
    ? { name: session.user.name ?? "Account", role: session.user.role }
    : null;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4">
        <div className="flex items-center gap-3 md:gap-8">
          <MobileNav user={user} />
          <Link
            href="/"
            className="text-lg font-bold tracking-tight sm:text-xl"
          >
            Game<span className="text-primary">Store</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartButton />
          {user ? (
            <UserMenu name={user.name} role={user.role} />
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/login"
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3"
              >
                Login
              </Link>
              <Link href="/register">
                <Button size="sm" className="px-2 sm:px-4">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
