"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth";
import type { FormState } from "@/types";

export function LoginForm({
  callbackUrl = null,
}: {
  callbackUrl?: string | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    loginAction,
    null,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to your GameStore account.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        {callbackUrl ? (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        ) : null}
        {state?.message && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
            {state.helpHref ? (
              <>
                {" "}
                <Link
                  href={state.helpHref}
                  className="font-medium underline underline-offset-2"
                >
                  {state.helpLabel ?? "Get help"}
                </Link>
              </>
            ) : null}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
