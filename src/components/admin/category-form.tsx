"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";
import type { UploadedImage } from "@/components/admin/image-uploader";
import type { FormState } from "@/types";

type CategoryFormProps = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initial?: {
    name: string;
    description: string;
    image: UploadedImage | null;
  };
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function CategoryForm({ action, initial }: CategoryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [image, setImage] = useState<UploadedImage | null>(initial?.image ?? null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Saved");
      if (initial) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        formRef.current?.reset();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImage(null);
      }
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
    >
      {!initial && <h2 className="font-semibold">Add category</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required />
          <FieldError errors={state?.errors?.name} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Image (optional)</Label>
          <SingleImageUploader image={image} onChange={setImage} />
          <FieldError errors={state?.errors?.image} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            defaultValue={initial?.description}
          />
          <FieldError errors={state?.errors?.description} />
        </div>
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : initial ? "Update category" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
