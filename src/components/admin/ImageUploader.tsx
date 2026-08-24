"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_EDGE = 1600;
const QUALITY = 0.82;

/**
 * §12 - "drag-drop upload to Supabase Storage with WebP conversion."
 *
 * Conversion happens in the browser on a canvas rather than server-side:
 * `sharp` doesn't run on Cloudflare Workers (§3.1), so the alternative
 * would be shipping an image pipeline we can't host. This also means a
 * 4MB phone photo leaves the baker's device as a ~200KB WebP, which
 * matters on Pakistani mobile data.
 *
 * Falls back to the original file if the browser can't encode WebP.
 */
async function toWebp(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY)
    );
    bitmap.close();

    return blob ?? file;
  } catch {
    return file;
  }
}

export function ImageUploader({
  bucket,
  value,
  onChange,
  label = "Image",
}: {
  bucket: "products" | "categories";
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError(null);

    try {
      const blob = await toWebp(file);
      const extension = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
      const path = `${crypto.randomUUID()}.${extension}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType: blob.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError("Upload failed. Try a smaller picture.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60">
        {label}
      </span>

      {value ? (
        <div className="relative h-32 w-full overflow-hidden rounded-md border border-cream-200">
          <Image src={value} alt="" fill sizes="320px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-md bg-cocoa-900/70 text-cream-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-sm transition-colors ${
            dragging ? "border-rosewood bg-rosewood/5" : "border-cream-200 bg-cream-50"
          }`}
        >
          <ImagePlus className="h-5 w-5 text-ink/45" />
          <span className="text-ink/60">{busy ? "Uploading…" : "Tap or drop a picture"}</span>
          <span className="text-xs text-ink/40">Converted to WebP automatically</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </label>
      )}

      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
