from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "docs" / "gats-architecture-bright-centered.png"
FONT_PATH = Path(r"C:\Windows\Fonts\arialbd.ttf")


def main() -> None:
    image = Image.open(IMAGE_PATH).convert("RGB")

    # Remove only the generated heading, rebuilding its pale-blue background
    # from pixels immediately above and below the text.
    left, top, right, bottom = 300, 631, 570, 674
    source = image.load()
    patch = Image.new("RGB", (right - left + 1, bottom - top + 1))
    pixels = patch.load()
    for py in range(patch.height):
        v = py / max(1, patch.height - 1)
        for px in range(patch.width):
            x = left + px
            upper = source[x, top - 5]
            lower = source[x, bottom + 5]
            pixels[px, py] = tuple(
                round(upper[channel] * (1 - v) + lower[channel] * v)
                for channel in range(3)
            )

    mask = Image.new("L", patch.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((5, 2, patch.width - 6, patch.height - 3), radius=8, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(4))
    image.paste(patch, (left, top), mask)

    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(FONT_PATH), 27)
    draw.text(
        ((left + right) / 2, 653),
        "NGHI\u1ec6P V\u1ee4 L\u00d5I",
        font=font,
        fill=(10, 35, 78),
        anchor="mm",
    )
    image.save(IMAGE_PATH, "PNG", optimize=True)
    print(f"Updated: {IMAGE_PATH}")


if __name__ == "__main__":
    main()
