"""Tách nền đen → PNG trong suốt cho coach ghi chú quiz."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "images" / "ghi_chu_raw.jpg"
OUT = ROOT / "assets" / "images" / "coach_notetaking.png"


def remove_black_background(img: Image.Image, *, threshold: int = 42) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Nền đen + vùng khói mờ dưới chân — alpha theo độ sáng.
            luminance = max(r, g, b)
            if luminance <= threshold:
                pixels[x, y] = (r, g, b, 0)
            elif luminance <= threshold + 36:
                fade = int(255 * (luminance - threshold) / 36)
                pixels[x, y] = (r, g, b, min(a, fade))

    return rgba


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")

    img = Image.open(SRC)
    out = remove_black_background(img)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB, {out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
