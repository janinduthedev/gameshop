"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/actions/user";
import type { FormState } from "@/types";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function ChangePasswordCard() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    changePasswordAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Password updated successfully.");
      formRef.current?.reset();
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Security & Password</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Ensure your account stays secure by using a strong password with letters and numbers.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
        {state?.message && !state.success && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}
        {state?.message && state.success && (
          <p className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
            {state.message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            autoComplete="current-password"
            required
          />
          <FieldError errors={state?.errors?.currentPassword} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            autoComplete="new-password"
            placeholder="At least 6 characters with letters and numbers"
            required
          />
          <FieldError errors={state?.errors?.newPassword} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
          />
          <FieldError errors={state?.errors?.confirmPassword} />
        </div>

        <div>
          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Updating password..." : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
