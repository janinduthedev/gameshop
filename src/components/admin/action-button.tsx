"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/types";

type ActionButtonProps = {
  action: () => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
  confirmMessage?: string;
  successMessage?: string;
  redirectTo?: string;
};

/**
 * Small client wrapper for invoking a server action from a button,
 * with a confirmation prompt and toast feedback.
 */
export function ActionButton({
  action,
  children,
  className,
  confirmMessage,
  successMessage,
  redirectTo,
}: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.success) {
            toast.success(successMessage ?? result.message ?? "Done");
            if (redirectTo) {
              router.push(redirectTo);
            } else {
              router.refresh();
            }
          } else if (result?.message) {
            toast.error(result.message);
          }
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
