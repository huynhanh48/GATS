/** Build a cropped JPEG Blob from an image URL + react-easy-crop area. */

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Không tải được ảnh")));
    // Same-origin blob: / data: need no CORS; remote MinIO may need crossOrigin
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.src = src;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  options?: { mimeType?: string; quality?: number; fileName?: string },
): Promise<File> {
  const image = await loadImage(imageSrc);
  const natW = image.naturalWidth || image.width;
  const natH = image.naturalHeight || image.height;

  // Clamp to natural bounds — react-easy-crop can return subpixel overflow.
  const x = Math.min(Math.max(0, Math.round(crop.x)), Math.max(0, natW - 1));
  const y = Math.min(Math.max(0, Math.round(crop.y)), Math.max(0, natH - 1));
  const width = Math.max(
    1,
    Math.min(Math.round(crop.width), natW - x),
  );
  const height = Math.max(
    1,
    Math.min(Math.round(crop.height), natH - y),
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas không khả dụng");

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  const mimeType = options?.mimeType ?? "image/jpeg";
  const quality = options?.quality ?? 0.92;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Không xuất được ảnh"))),
      mimeType,
      quality,
    );
  });

  const fileName = options?.fileName ?? `cover-${Date.now()}.jpg`;
  return new File([blob], fileName, { type: mimeType });
}
