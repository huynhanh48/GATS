"""Generate starry sky background PNG matching starry_sky_background.dart painters."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw

WIDTH = 1080
HEIGHT = 2340
SEED = 42
STAR_COUNT = 120

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

    img.save(out_path, optimize=True)
    print(f"Wrote {out_path} ({out_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
