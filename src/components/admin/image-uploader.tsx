"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";

export type UploadedImage = { url: string; publicId: string };

type ImageUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
};

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploaded: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed");
        }
        uploaded.push(await response.json());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }

    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={image.url}
            className="group relative h-24 w-24 overflow-hidden rounded-md border"
          >
            <Image src={image.url} alt="" fill sizes="96px" className="object-contain" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-xs">{uploading ? "Uploading" : "Add image"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {images.map((image) => (
        <input key={image.url} type="hidden" name="images" value={image.url} />
      ))}
      {images.map((image) => (
        <input
          key={`${image.url}-pid`}
          type="hidden"
          name="publicIds"
          value={image.publicId}
        />
      ))}
    </div>
  );
}
