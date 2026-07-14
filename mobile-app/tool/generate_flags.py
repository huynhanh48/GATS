"""Generate crisp PNG language flags (3:2) for the language picker."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

WIDTH = 360
HEIGHT = 240

VN_RED = (218, 37, 29)
VN_YELLOW = (255, 255, 0)

US_RED = (178, 34, 52)
US_WHITE = (255, 255, 255)
US_BLUE = (60, 59, 110)


def _star_polygon(cx: float, cy: float, outer: float, inner: float, points: int = 5) -> list[tuple[float, float]]:
    coords: list[tuple[float, float]] = []
    start = -math.pi / 2
    for i in range(points * 2):
        angle = start + i * math.pi / points
        radius = outer if i % 2 == 0 else inner
        coords.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return coords


def draw_vietnam_flag() -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), VN_RED)
    draw = ImageDraw.Draw(img)
    # Dịch nhẹ lên trên để sao cân bằng thị giác (đỉnh sao nhọn tạo cảm giác lệch xuống).
    star = _star_polygon(
        WIDTH / 2,
        HEIGHT / 2 - HEIGHT * 0.02,
        outer=HEIGHT * 0.30,
        inner=HEIGHT * 0.11,
    )
    draw.polygon(star, fill=VN_YELLOW)
    return img


def draw_us_flag() -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), US_WHITE)
    draw = ImageDraw.Draw(img)

    stripe_h = HEIGHT / 13
    for i in range(13):
        y0 = i * stripe_h
        y1 = (i + 1) * stripe_h
        if i % 2 == 0:
            draw.rectangle((0, y0, WIDTH, y1), fill=US_RED)

    canton_w = WIDTH * 0.4
    canton_h = stripe_h * 7
    draw.rectangle((0, 0, canton_w, canton_h), fill=US_BLUE)

    rows = 9
    margin_x = canton_w * 0.11
    margin_y = canton_h * 0.14
    step_x = (canton_w - margin_x * 2) / 5
    step_y = (canton_h - margin_y * 2) / (rows - 1)
    star_outer = stripe_h * 0.22
    star_inner = star_outer * 0.38

    for row in range(rows):
        is_even = row % 2 == 0
        row_cols = 6 if is_even else 5
        x_start = margin_x if is_even else margin_x + step_x / 2
        cy = margin_y + row * step_y
        for col in range(row_cols):
            cx = x_start + col * step_x
            star = _star_polygon(cx, cy, star_outer, star_inner)
            draw.polygon(star, fill=US_WHITE)

    return img


def main() -> None:
    out_dir = Path(__file__).resolve().parent.parent / "assets" / "images" / "flags"
    out_dir.mkdir(parents=True, exist_ok=True)

    vn_path = out_dir / "flag_vn.png"
    us_path = out_dir / "flag_us.png"

    draw_vietnam_flag().save(vn_path, optimize=True)
    draw_us_flag().save(us_path, optimize=True)

    print(f"Wrote {vn_path} ({vn_path.stat().st_size // 1024} KB)")
    print(f"Wrote {us_path} ({us_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
