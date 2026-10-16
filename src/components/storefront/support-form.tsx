"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupportMessageAction } from "@/actions/support";
import type { FormState } from "@/types";

type SupportFormProps = {
  defaultName?: string;
  defaultEmail?: string;
};

export function SupportForm({
  defaultName = "",
  defaultEmail = "",
}: SupportFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createSupportMessageAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Message sent");
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card px-6 py-12 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h2 className="text-lg font-semibold">Message sent</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultName}
            autoComplete="name"
            required
          />
          <FieldError errors={state?.errors?.name} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            autoComplete="email"
            required
          />
          <FieldError errors={state?.errors?.email} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
        <FieldError errors={state?.errors?.subject} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={6} required />
        <FieldError errors={state?.errors?.message} />
      </div>

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
