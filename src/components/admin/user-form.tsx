"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/types";

type UserFormProps = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initial: { name: string; email: string };
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function UserForm({ action, initial }: UserFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Saved");
      router.push("/admin/users");
      router.refresh();
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initial.name} required />
        <FieldError errors={state?.errors?.name} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initial.email}
          required
        />
        <FieldError errors={state?.errors?.email} />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Update user"}
        </Button>
      </div>
    </form>
  );
}
