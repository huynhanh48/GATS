from pathlib import Path
import shutil

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "docs" / "gats-architecture-bright.png"
BACKUP_PATH = ROOT / "docs" / "gats-architecture-bright-before-text-fix.png"
FONT_PATH = Path(r"C:\Windows\Fonts\arialbd.ttf")


def main() -> None:
    if not BACKUP_PATH.exists():
        shutil.copy2(IMAGE_PATH, BACKUP_PATH)

    # Luôn dựng lại từ bản trước khi vá để tránh chồng nhiều lớp chỉnh sửa.
    image = Image.open(BACKUP_PATH).convert("RGB")

    # Xóa riêng nhãn sai bằng nền bilinear và feather mép, không chạm hai đường viền.
    left, top, right, bottom = 565, 386, 785, 418
    source = image.load()
    patch = Image.new("RGB", (right - left + 1, bottom - top + 1))
    patch_pixels = patch.load()
    top_left = source[left - 1, top - 1]
    top_right = source[right + 1, top - 1]
    bottom_left = source[left - 1, bottom + 1]
    bottom_right = source[right + 1, bottom + 1]
    for py in range(patch.height):
        v = py / max(1, patch.height - 1)
        for px in range(patch.width):
            u = px / max(1, patch.width - 1)
            patch_pixels[px, py] = tuple(
                round(
                    top_left[channel] * (1 - u) * (1 - v)
                    + top_right[channel] * u * (1 - v)
                    + bottom_left[channel] * (1 - u) * v
                    + bottom_right[channel] * u * v
                )
                for channel in range(3)
            )

    mask = Image.new("L", patch.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((5, 3, patch.width - 6, patch.height - 4), radius=8, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5))
    image.paste(patch, (left, top), mask)

    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(FONT_PATH), 19)
    draw.text(
        ((left + right) / 2, 402),
        "NGHIỆP VỤ LÕI",
        font=font,
        fill=(12, 35, 82),
        anchor="mm",
    )

    image.save(IMAGE_PATH, "PNG", optimize=True)
    print(f"Updated: {IMAGE_PATH}")
    print(f"Backup:  {BACKUP_PATH}")


if __name__ == "__main__":
    main()
