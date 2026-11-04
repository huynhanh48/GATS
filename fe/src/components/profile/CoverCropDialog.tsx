"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Check, Loader2, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { getCroppedImageBlob } from "@/lib/media/cropImage";
import { COVER_ASPECT } from "@/lib/media/coverAspect";

type Props = {
  imageSrc: string;
  open: boolean;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
};

export function CoverCropDialog({
  imageSrc,
  open,
  saving = false,
  onCancel,
  onConfirm,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  if (!open) return null;

  const handleSave = async () => {
    if (!croppedAreaPixels || busy || saving) return;
    setBusy(true);
    try {
      const file = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        fileName: `cover-${Date.now()}.jpg`,
      });
      await onConfirm(file);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không cắt được ảnh bìa",
      );
    } finally {
      setBusy(false);
    }
  };

  const locked = busy || saving;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cover-crop-title"
    >
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2
              id="cover-crop-title"
              className="text-lg font-bold text-foreground"
            >
              Chọn khung ảnh bìa
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Khung 3:1 — đúng tỷ lệ khi hiển thị trên hồ sơ. Kéo và phóng to để
              chọn vùng.
            </p>
          </div>
          <button
            type="button"
            disabled={locked}
            onClick={onCancel}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Same 3:1 stage as profile banner so preview matches output */}
        <div className="w-full bg-black px-4 py-4 sm:px-6">
          <div className="relative mx-auto aspect-[3/1] w-full max-w-3xl overflow-hidden rounded-xl">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={COVER_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
              objectFit="contain"
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  background: "#000",
                },
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-1 items-center gap-3 text-sm text-muted-foreground">
            <ZoomIn className="h-4 w-4 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              disabled={locked}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#ff782d]"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={locked}
              onClick={onCancel}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={locked || !croppedAreaPixels}
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {locked ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {locked ? "Đang lưu..." : "Lưu khung"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
