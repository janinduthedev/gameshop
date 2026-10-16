"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader({ name }: { name: string }) {
  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b bg-card/40 px-4 md:px-6">
      <Link href="/admin" className="text-lg font-bold md:hidden">
        GameStore
      </Link>
      <p className="hidden text-sm text-muted-foreground sm:block">
        Signed in as <span className="font-medium text-foreground">{name}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
