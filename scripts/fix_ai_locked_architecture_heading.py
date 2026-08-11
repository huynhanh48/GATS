from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "docs" / "gats-architecture-ai-centered-locked.png"
FONT_PATH = Path(r"C:\Windows\Fonts\arialbd.ttf")


def main() -> None:
    image = Image.open(IMAGE_PATH).convert("RGB")
    left, top, right, bottom = 385, 518, 640, 558
    source = image.load()
    patch = Image.new("RGB", (right - left + 1, bottom - top + 1))
    pixels = patch.load()

    for py in range(patch.height):
        v = py / max(1, patch.height - 1)
        for px in range(patch.width):
            x = left + px
            upper = source[x, top - 4]
            lower = source[x, bottom + 4]
            pixels[px, py] = tuple(
                round(upper[channel] * (1 - v) + lower[channel] * v)
                for channel in range(3)
            )

    mask = Image.new("L", patch.size, 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle((4, 2, patch.width - 5, patch.height - 3), radius=8, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(4))
    image.paste(patch, (left, top), mask)

    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(FONT_PATH), 21)
    draw.text(
        ((left + right) / 2, 539),
        "NGHI\u1ec6P V\u1ee4 L\u00d5I",
        font=font,
        fill=(8, 31, 72),
        anchor="mm",
    )
    image.save(IMAGE_PATH, "PNG", optimize=True)


if __name__ == "__main__":
    main()
