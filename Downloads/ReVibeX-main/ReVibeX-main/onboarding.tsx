// Client-side image compression. Resizes large photos to a max edge and re-encodes
// as JPEG to keep uploads fast and storage usage low. Falls back to the original
// file if anything goes wrong (e.g. HEIC the browser can't decode).
export async function compressImage(
  file: File,
  opts: { maxEdge?: number; quality?: number } = {},
): Promise<File> {
  const { maxEdge = 1600, quality = 0.82 } = opts;

  // Only attempt to compress real raster images we know browsers can decode.
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file; // preserve animation

  try {
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) return file;

    const { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    // Skip work if image is already small AND already a reasonable format.
    if (scale === 1 && file.size < 600 * 1024 && (file.type === "image/jpeg" || file.type === "image/webp")) {
      bitmap.close?.();
      return file;
    }

    const canvas = typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement("canvas"), { width: targetW, height: targetH });
    const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) { bitmap.close?.(); return file; }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob: Blob | null = await (canvas instanceof OffscreenCanvas
      ? canvas.convertToBlob({ type: "image/jpeg", quality })
      : new Promise<Blob | null>((resolve) =>
          (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), "image/jpeg", quality),
        ));
    if (!blob) return file;

    // If compression made it bigger (rare), keep the original.
    if (blob.size >= file.size) return file;

    const baseName = (file.name || "photo").replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
