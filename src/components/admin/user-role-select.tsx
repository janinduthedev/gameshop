"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/actions/user";
import { ROLES, type Role } from "@/constants";

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<Role>(role);
  const router = useRouter();

  return (
    <select
      value={value}
      disabled={disabled || pending}
      onChange={(event) => {
        const nextRole = event.target.value as Role;
        const previous = value;
        setValue(nextRole);
        startTransition(async () => {
          const result = await updateUserRoleAction(userId, nextRole);
          if (result?.success) {
            toast.success(result.message ?? "Role updated");
            router.refresh();
          } else {
            setValue(previous);
            if (result?.message) {
              toast.error(result.message);
            }
          }
        });
      }}
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
    >
      {Object.values(ROLES).map((roleOption) => (
        <option key={roleOption} value={roleOption}>
          {roleOption}
        </option>
      ))}
    </select>
  );
}
