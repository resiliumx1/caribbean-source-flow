/**
 * Client-side image compression utility.
 * Resizes and compresses images to WebP before upload.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  skipUnder?: number; // Skip compression if file is under this size in bytes
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  skipUnder: 100 * 1024, // 100KB
};

export async function compressImage(
  file: File,
  options?: CompressOptions
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip if already small enough
  if (opts.skipUnder && file.size <= opts.skipUnder) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const maxW = opts.maxWidth!;
      const maxH = opts.maxHeight!;

      // Scale down if needed
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      const tryFormat = (mime: string, q: number) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = mime === "image/webp" ? "webp" : "jpg";
              const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
              resolve(new File([blob], name, { type: mime }));
            } else if (mime === "image/webp") {
              // WebP not supported, try JPEG
              tryFormat("image/jpeg", 0.85);
            } else {
              resolve(file); // give up, return original
            }
          },
          mime,
          q
        );
      };

      tryFormat("image/webp", opts.quality!);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback to original on error
    };

    img.src = url;
  });
}
