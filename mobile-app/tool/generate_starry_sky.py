"""Generate starry sky background PNG (gradient + stars + clouds + moon)."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

WIDTH = 1080
HEIGHT = 2340
SEED = 42
STAR_COUNT = 120

# Vị trí moon khớp StarrySkyBackground cũ: left 24, top safe+8, size 72 @ 360pt width.
MOON_LOGICAL_LEFT = 24
MOON_LOGICAL_TOP = 67
MOON_LOGICAL_SIZE = 72
MOON_OPACITY = 0.9

NIGHT_SKY_TOP = (0x1A, 0x21, 0x51)
NIGHT_SKY_BOTTOM = (0x0B, 0x11, 0x2B)
NIGHT_CLOUD = (0x2A, 0x1F, 0x5E)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def generate_stars() -> list[tuple[float, float, float, float]]:
    rng = random.Random(SEED)
    stars: list[tuple[float, float, float, float]] = []
    for _ in range(STAR_COUNT):
        stars.append(
            (
                rng.random(),
                rng.random() * 0.85,
                rng.random() * 1.6 + 0.4,
                rng.random() * 0.55 + 0.25,
            )
        )
    return stars


def draw_gradient(img: Image.Image) -> None:
    px = img.load()
    for y in range(HEIGHT):
        t = y / max(HEIGHT - 1, 1)
        color = (
            lerp(NIGHT_SKY_TOP[0], NIGHT_SKY_BOTTOM[0], t),
            lerp(NIGHT_SKY_TOP[1], NIGHT_SKY_BOTTOM[1], t),
            lerp(NIGHT_SKY_TOP[2], NIGHT_SKY_BOTTOM[2], t),
            255,
        )
        for x in range(WIDTH):
            px[x, y] = color


def draw_stars(draw: ImageDraw.ImageDraw, stars: list[tuple[float, float, float, float]]) -> None:
    for x, y, radius, opacity in stars:
        cx = x * WIDTH
        cy = y * HEIGHT
        alpha = int(opacity * 255)
        bbox = (cx - radius, cy - radius, cx + radius, cy + radius)
        draw.ellipse(bbox, fill=(255, 255, 255, alpha))


def draw_cloud(
    draw: ImageDraw.ImageDraw,
    *,
    center_x: float,
    center_y: float,
    scale: float,
    alpha: int,
) -> None:
    r = 36.0 * scale
    fill = (*NIGHT_CLOUD, alpha)
    draw.ellipse(
        (center_x - r * 0.8 - r * 0.9, center_y - r * 0.9, center_x - r * 0.8 + r * 0.9, center_y + r * 0.9),
        fill=fill,
    )
    draw.ellipse(
        (center_x - r, center_y - r * 0.2 - r, center_x + r, center_y - r * 0.2 + r),
        fill=fill,
    )
    draw.ellipse(
        (center_x + r * 0.85 - r * 0.85, center_y - r * 0.85, center_x + r * 0.85 + r * 0.85, center_y + r * 0.85),
        fill=fill,
    )
    rect = (
        center_x - r * 1.6,
        center_y + r * 0.15 - r * 0.55,
        center_x + r * 1.6,
        center_y + r * 0.15 + r * 0.55,
    )
    draw.rounded_rectangle(rect, radius=24, fill=fill)


def _moon_glow_alpha(moon_rgb: Image.Image) -> Image.Image:
    """Chỉ giữ vùng sáng (trăng + halo), bỏ nền tối của asset moon."""
    lum = moon_rgb.convert("L")
    w, h = lum.size
    corners = (
        lum.getpixel((2, 2)),
        lum.getpixel((w - 3, 2)),
        lum.getpixel((2, h - 3)),
        lum.getpixel((w - 3, h - 3)),
    )
    bg_level = min(corners)
    cutoff = bg_level + 12
    span = max(1, 220 - cutoff)

    def alpha_map(value: int) -> int:
        if value <= cutoff:
            return 0
        t = (value - cutoff) / span
        t = 1 - (1 - min(1.0, t)) ** 1.6
        return int(t * 255 * MOON_OPACITY)

    return lum.point(alpha_map)


def composite_moon(img: Image.Image, moon_path: Path) -> None:
    if not moon_path.is_file():
        return

    scale = WIDTH / 360.0
    moon_size = max(1, int(MOON_LOGICAL_SIZE * scale))
    moon_left = int(MOON_LOGICAL_LEFT * scale)
    moon_top = int(MOON_LOGICAL_TOP * scale)

    moon = Image.open(moon_path).convert("RGB")
    moon = moon.resize((moon_size, moon_size), Image.Resampling.LANCZOS)
    moon = moon.filter(ImageFilter.GaussianBlur(radius=0.6))

    r, g, b = moon.split()
    alpha = _moon_glow_alpha(moon)
    moon_rgba = Image.merge("RGBA", (r, g, b, alpha))

    region = img.crop((moon_left, moon_top, moon_left + moon_size, moon_top + moon_size))
    blended = Image.alpha_composite(region, moon_rgba)
    img.paste(blended, (moon_left, moon_top))


def main() -> None:
    out_dir = Path(__file__).resolve().parent.parent / "assets" / "images"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "starry_sky_bg.png"

    img = Image.new("RGBA", (WIDTH, HEIGHT), NIGHT_SKY_BOTTOM + (255,))
    draw_gradient(img)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_stars(draw, generate_stars())

    cloud_alpha = int(0.55 * 255)
    draw_cloud(draw, center_x=WIDTH * 0.2, center_y=HEIGHT * 0.78, scale=1.1, alpha=cloud_alpha)
    draw_cloud(draw, center_x=WIDTH * 0.75, center_y=HEIGHT * 0.88, scale=0.9, alpha=cloud_alpha)
    draw_cloud(draw, center_x=WIDTH * 0.5, center_y=HEIGHT * 0.95, scale=1.4, alpha=cloud_alpha)

    moon_path = Path(__file__).resolve().parent / "assets" / "starry_moon_glow.png"
    composite_moon(img, moon_path)

    img.save(out_path, optimize=True)
    print(f"Wrote {out_path} ({out_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
