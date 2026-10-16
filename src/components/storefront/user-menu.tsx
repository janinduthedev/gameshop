"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LayoutDashboard, LogOut, Package, User } from "lucide-react";

type UserMenuProps = {
  name: string;
  role: "admin" | "user";
};

export function UserMenu({ name, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <User className="h-4 w-4" />
        <span className="max-w-24 truncate">{name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border bg-card shadow-lg">
            {role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin dashboard
              </Link>
            )}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent"
            >
              <Package className="h-4 w-4" />
              My account
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
