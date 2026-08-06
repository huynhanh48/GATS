from __future__ import annotations

import re
import shutil
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "docs" / "so-do-kien-truc-he-thong-5-cap.docx"
SVG = ROOT / "docs" / "gats-architecture-polished.svg"
BACKUP = ROOT / "docs" / "so-do-kien-truc-he-thong-5-cap-before-svg.docx"
TEMP = DOCX.with_suffix(".svg-update.tmp.docx")

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PR_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"

NS = {"w": W_NS, "a": A_NS, "r": R_NS, "pr": PR_NS, "ct": CT_NS, "wp": WP_NS}


def svg_ratio(svg_bytes: bytes) -> float:
    root = etree.fromstring(svg_bytes)
    view_box = root.get("viewBox")
    if view_box:
        _, _, width, height = (float(value) for value in view_box.split())
        return height / width

    def number(value: str | None) -> float:
        if not value:
            raise ValueError("SVG không có kích thước")
        match = re.match(r"[0-9.]+", value)
        if not match:
            raise ValueError(f"Kích thước SVG không hợp lệ: {value}")
        return float(match.group())

    return number(root.get("height")) / number(root.get("width"))


def ensure_svg_content_type(content_types: etree._Element) -> None:
    existing = content_types.xpath('//ct:Default[@Extension="svg"]', namespaces=NS)
    if existing:
        existing[0].set("ContentType", "image/svg+xml")
        return
    default = etree.SubElement(content_types, f"{{{CT_NS}}}Default")
    default.set("Extension", "svg")
    default.set("ContentType", "image/svg+xml")


def main() -> None:
    if not DOCX.exists():
        raise FileNotFoundError(DOCX)
    if not SVG.exists():
        raise FileNotFoundError(SVG)

    if not BACKUP.exists():
        shutil.copy2(DOCX, BACKUP)

    svg_bytes = SVG.read_bytes()
    ratio = svg_ratio(svg_bytes)
    width_emu = int(10.1 * 914_400)  # Gần hết bề ngang trang A3 dọc.
    height_emu = int(width_emu * ratio)

    with ZipFile(DOCX, "r") as source:
        document = etree.fromstring(source.read("word/document.xml"))
        relationships = etree.fromstring(source.read("word/_rels/document.xml.rels"))
        content_types = etree.fromstring(source.read("[Content_Types].xml"))

        blips = document.xpath("//a:blip", namespaces=NS)
        if not blips:
            raise ValueError("Không tìm thấy hình trong tài liệu")

        first_blip = blips[0]
        relation_id = first_blip.get(f"{{{R_NS}}}embed")
        relation = relationships.xpath(
            f'//pr:Relationship[@Id="{relation_id}"]', namespaces=NS
        )
        if not relation:
            raise ValueError(f"Không tìm thấy relationship {relation_id}")
        relation[0].set("Target", "media/gats-architecture-polished.svg")

        drawing = first_blip.xpath("ancestor::w:drawing[1]", namespaces=NS)[0]
        for extent in drawing.xpath(".//wp:extent", namespaces=NS):
            extent.set("cx", str(width_emu))
            extent.set("cy", str(height_emu))
        for extent in drawing.xpath(".//a:xfrm/a:ext", namespaces=NS):
            extent.set("cx", str(width_emu))
            extent.set("cy", str(height_emu))
        for properties in drawing.xpath(".//wp:docPr", namespaces=NS):
            properties.set("name", "Sơ đồ kiến trúc GATS Academy 5 cấp")
            properties.set("descr", "Sơ đồ kiến trúc hệ thống GATS Academy gồm kênh truy cập, Nginx, Backend, Viava, xử lý nền, dữ liệu và hạ tầng")

        paragraph = drawing.xpath("ancestor::w:p[1]", namespaces=NS)[0]
        paragraph_properties = paragraph.find(f"{{{W_NS}}}pPr")
        if paragraph_properties is None:
            paragraph_properties = etree.Element(f"{{{W_NS}}}pPr")
            paragraph.insert(0, paragraph_properties)
        justification = paragraph_properties.find(f"{{{W_NS}}}jc")
        if justification is None:
            justification = etree.SubElement(paragraph_properties, f"{{{W_NS}}}jc")
        justification.set(f"{{{W_NS}}}val", "center")

        ensure_svg_content_type(content_types)

        replacements = {
            "word/document.xml": etree.tostring(
                document, xml_declaration=True, encoding="UTF-8", standalone="yes"
            ),
            "word/_rels/document.xml.rels": etree.tostring(
                relationships, xml_declaration=True, encoding="UTF-8", standalone="yes"
            ),
            "[Content_Types].xml": etree.tostring(
                content_types, xml_declaration=True, encoding="UTF-8", standalone="yes"
            ),
        }

        with ZipFile(TEMP, "w", ZIP_DEFLATED) as target:
            for item in source.infolist():
                target.writestr(item, replacements.get(item.filename, source.read(item.filename)))
            target.writestr("word/media/gats-architecture-polished.svg", svg_bytes)

    TEMP.replace(DOCX)
    print(f"Updated: {DOCX}")
    print(f"Backup:  {BACKUP}")
    print(f"SVG size: {width_emu / 914400:.2f} x {height_emu / 914400:.2f} inches")


if __name__ == "__main__":
    main()
