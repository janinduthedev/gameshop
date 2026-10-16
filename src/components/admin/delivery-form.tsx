"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/types";

type DeliveryFormProps = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initial: { courier: string; trackingNumber: string; trackingUrl?: string };
  orderStatus?: string;
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function DeliveryForm({ action, initial, orderStatus }: DeliveryFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  const [trackingNumber, setTrackingNumber] = useState(initial.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(initial.trackingUrl || "");
  const isAlreadyDelivered = orderStatus === "delivered";

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Saved");
      router.refresh();
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Construct effective courier tracking URL (replaces placeholder {trackingNumber} if present)
  const resolvedExternalUrl = trackingUrl
    ? trackingUrl.includes("{trackingNumber}")
      ? trackingUrl.replace("{trackingNumber}", encodeURIComponent(trackingNumber.trim()))
      : trackingUrl
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="courier">Courier service</Label>
        <Input
          id="courier"
          name="courier"
          defaultValue={initial.courier}
          placeholder="e.g. Domex, Pronto, Koombiyo, DHL"
          required
        />
        <FieldError errors={state?.errors?.courier} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="trackingNumber">Tracking number</Label>
        <Input
          id="trackingNumber"
          name="trackingNumber"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. DXM123456789"
          required
        />
        <FieldError errors={state?.errors?.trackingNumber} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="trackingUrl">Courier tracking portal link (optional)</Label>
          {resolvedExternalUrl ? (
            <a
              href={resolvedExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Test courier link <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
        <Input
          id="trackingUrl"
          name="trackingUrl"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://track.courier.com/status?id={trackingNumber}"
        />
        <p className="text-xs text-muted-foreground">
          Tip: You can use <code className="rounded bg-muted px-1 font-mono text-[11px]">&#123;trackingNumber&#125;</code> as a placeholder link so the customer or admin can jump directly to the courier live portal.
        </p>
        <FieldError errors={state?.errors?.trackingUrl} />
      </div>

      {!isAlreadyDelivered ? (
        <div className="mt-1 rounded-md border border-primary/20 bg-primary/5 p-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="markDelivered"
              value="true"
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> Courier confirmed delivery
              </span>
              <p className="text-muted-foreground mt-0.5">
                Check this box when the courier service informs that the product was delivered to the customer to immediately submit and mark the order as <strong>Delivered</strong>.
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          This order has been confirmed and marked as Delivered.
        </div>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save delivery details"}
        </Button>
      </div>
    </form>
  );
}
