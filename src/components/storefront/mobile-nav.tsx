"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu, Package, User, X } from "lucide-react";
import { siteConfig } from "@/config/site";

type MobileNavProps = {
  user: { name: string; role: "admin" | "user" } | null;
};

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="-ml-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background p-4">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={close} className="text-lg font-bold">
                Game<span className="text-primary">Store</span>
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-1 border-t pt-4">
              {user ? (
                <>
                  <p className="px-3 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {user.name}
                  </p>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin dashboard
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={close}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    <Package className="h-4 w-4" />
                    My account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                  <Link href="/register" onClick={close}>
                    <span className="block rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      Sign up
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
