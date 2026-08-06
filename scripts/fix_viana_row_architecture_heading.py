from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "docs" / "gats-architecture-viana-module-row-draft.png"


def main() -> None:
    image = Image.open(IMAGE_PATH).convert("RGB")
    left, top, right, bottom = 300, 607, 570, 646
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
                round(upper[c] * (1 - v) + lower[c] * v) for c in range(3)
            )
    mask = Image.new("L", patch.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((4, 2, patch.width - 5, patch.height - 3), radius=8, fill=255)
    image.paste(patch, (left, top), mask.filter(ImageFilter.GaussianBlur(4)))
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 23)
    draw.text(
        ((left + right) / 2, 627),
        "NGHI\u1ec6P V\u1ee4 L\u00d5I",
        font=font,
        fill=(11, 43, 91),
        anchor="mm",
    )
    image.save(IMAGE_PATH, "PNG", optimize=True)


if __name__ == "__main__":
    main()
