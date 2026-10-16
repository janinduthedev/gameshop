"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { UploadedImage } from "./image-uploader";

type SingleImageUploaderProps = {
  image: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
};

export function SingleImageUploader({
  image,
  onChange,
}: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "gamestore/categories");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      onChange(await response.json());
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        className={`relative aspect-video w-full max-w-xs overflow-hidden rounded-md border bg-muted ${
          image ? "" : "border-dashed"
        }`}
      >
        {image ? (
          <>
            <Image
              src={image.url}
              alt=""
              fill
              sizes="320px"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-opacity hover:opacity-90"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
            <span className="text-xs">{uploading ? "Uploading" : "Add image"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files)}
      />
      <input type="hidden" name="image" value={image?.url ?? ""} />
      <input type="hidden" name="imagePublicId" value={image?.publicId ?? ""} />
    </div>
  );
}
