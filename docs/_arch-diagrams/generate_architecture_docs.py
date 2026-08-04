from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "_arch-diagrams"
DOCX = ROOT / "docs" / "so-do-kien-truc-he-thong.docx"
W, H = 1600, 900

NAVY = "#10243E"
MUTED = "#53657A"
BG = "#F6F8FB"
WHITE = "#FFFFFF"
LINE = "#D9E2EC"
BLUE = "#2563EB"
PURPLE = "#7C3AED"
GREEN = "#059669"
RED = "#DC2626"
TEAL = "#0891B2"
AMBER = "#D99000"
ORANGE = "#FF7622"

FONT_REG = "C:/Windows/Fonts/arial.ttf"
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def canvas(title, subtitle=None):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((54, 34), title, font=font(34, True), fill=NAVY)
    if subtitle:
        d.text((56, 82), subtitle, font=font(18), fill=MUTED)
    return im, d


def rounded(d, box, fill=WHITE, outline=LINE, radius=18, width=2):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def centered(d, box, text, size=22, color=NAVY, bold=False, spacing=5):
    x1, y1, x2, y2 = box
    f = font(size, bold)
    lines = text.split("\n")
    heights = [d.textbbox((0, 0), line, font=f)[3] for line in lines]
    total = sum(heights) + spacing * (len(lines) - 1)
    y = y1 + (y2 - y1 - total) / 2
    for line, height in zip(lines, heights):
        width = d.textbbox((0, 0), line, font=f)[2]
        d.text((x1 + (x2 - x1 - width) / 2, y), line, font=f, fill=color)
        y += height + spacing


def arrow(d, start, end, color=MUTED, width=4):
    d.line([start, end], fill=color, width=width)
    x, y = end
    if abs(end[0] - start[0]) >= abs(end[1] - start[1]):
        direction = 1 if end[0] > start[0] else -1
        pts = [(x, y), (x - 14 * direction, y - 8), (x - 14 * direction, y + 8)]
    else:
        direction = 1 if end[1] > start[1] else -1
        pts = [(x, y), (x - 8, y - 14 * direction), (x + 8, y - 14 * direction)]
    d.polygon(pts, fill=color)


def label_box(d, box, text, color, fill=WHITE, size=20, bold=False):
    rounded(d, box, fill=fill, outline=color, radius=16, width=2)
    centered(d, box, text, size=size, color=NAVY, bold=bold)


def save(im, name):
    path = OUT / name
    im.save(path, "PNG", optimize=True)
    return path


def architecture_layers():
    im, d = canvas(
        "GATS Academy — Kiến trúc hệ thống hiện tại",
        "Mobile chỉ dành cho học viên · Production chạy qua Nginx HTTPS",
    )

    # Clients
    d.text((55, 126), "1. KÊNH NGƯỜI DÙNG", font=font(20, True), fill=BLUE)
    clients = [
        ("Web học viên", "gats.vn · :3005"),
        ("Mobile học viên", "Flutter · iOS/Android"),
        ("Admin dashboard", "admin.gats.vn · :9000 nội bộ"),
    ]
    for i, (name, sub) in enumerate(clients):
        x = 55 + i * 505
        rounded(d, (x, 160, x + 460, 245), fill="#EFF6FF", outline=BLUE)
        d.text((x + 24, 180), name, font=font(23, True), fill=NAVY)
        d.text((x + 24, 214), sub, font=font(17), fill=MUTED)

    # Gateway
    rounded(d, (300, 292, 1300, 378), fill="#FFF7ED", outline=ORANGE)
    centered(
        d,
        (300, 292, 1300, 378),
        "NGINX / TLS — cổng 80/443\ngats.vn → Web & API  ·  admin.gats.vn → Admin  ·  api.gats.vn → API / Viava",
        size=20,
        bold=True,
    )
    for x in (285, 790, 1295):
        arrow(d, (x, 245), (x, 292), BLUE, 3)

    # App container
    d.text((55, 414), "2. CONTAINER ỨNG DỤNG — PM2", font=font(20, True), fill=GREEN)
    apps = [
        ("Web App", "Next.js :3005"),
        ("Admin", "Next.js :9000"),
        ("Backend API", "Express :3000"),
        ("Video Worker", "BullMQ + ffmpeg"),
        ("Viava AI", "FastAPI :8000"),
    ]
    for i, (name, sub) in enumerate(apps):
        x = 55 + i * 303
        rounded(d, (x, 448, x + 270, 538), fill="#ECFDF5", outline=GREEN)
        d.text((x + 20, 469), name, font=font(21, True), fill=NAVY)
        d.text((x + 20, 505), sub, font=font(16), fill=MUTED)
    # Nginx routes to Web, Admin, Backend and Viava (the worker has no HTTP route).
    for target_x in (190, 493, 796, 1402):
        arrow(d, (800, 378), (target_x, 448), ORANGE, 3)
    # Keep the section label readable above the fan-out connectors.
    d.rectangle((45, 402, 430, 442), fill=BG)
    d.text((55, 414), "2. CONTAINER ỨNG DỤNG — PM2", font=font(20, True), fill=GREEN)

    # Data and external are peers, not sequential layers.
    d.text((55, 548), "3. DỮ LIỆU & HÀNG ĐỢI", font=font(20, True), fill=PURPLE)
    data = [
        ("PostgreSQL", "Dữ liệu nghiệp vụ"),
        ("Redis / BullMQ", "Cache & hàng đợi"),
        ("MinIO", "File, ảnh, tài liệu"),
        ("S3 Video", "Video gốc & HLS"),
    ]
    for i, (name, sub) in enumerate(data):
        x = 55 + i * 300
        rounded(d, (x, 615, x + 265, 700), fill="#F5F3FF", outline=PURPLE)
        d.text((x + 18, 635), name, font=font(20, True), fill=NAVY)
        d.text((x + 18, 670), sub, font=font(15), fill=MUTED)
    # Backend and Worker share the data services; use a bus to avoid implying
    # that only one database/storage box is connected.
    d.line((796, 560, 1099, 560), fill=GREEN, width=4)
    d.line((796, 538, 796, 585), fill=GREEN, width=4)
    d.line((1099, 538, 1099, 560), fill=GREEN, width=4)
    data_centers = (187, 487, 787, 1087)
    d.line((data_centers[0], 585, data_centers[-1], 585), fill=GREEN, width=3)
    for center in data_centers:
        arrow(d, (center, 585), (center, 615), GREEN, 3)

    d.text((55, 742), "4. DỊCH VỤ BÊN NGOÀI", font=font(20, True), fill=AMBER)
    external = ["Google OAuth", "SePay QR / PG", "Email SMTP", "FCM", "Azure / Tavily / Qdrant"]
    for i, name in enumerate(external):
        x = 55 + i * 303
        label_box(d, (x, 777, x + 270, 842), name, AMBER, fill="#FFFBEB", size=18, bold=True)
    d.text(
        (1010, 735),
        "Backend / Viava kết nối theo cấu hình",
        font=font(15),
        fill=MUTED,
    )
    return save(im, "01-layers.png")


def mindmap():
    im, d = canvas(
        "GATS Academy — Bản đồ miền chức năng",
        "Nhãn “Kế hoạch” là chức năng chưa hoàn thiện ở production",
    )
    rounded(d, (575, 118, 1025, 205), fill=ORANGE, outline="#E85D04", radius=22, width=3)
    centered(d, (575, 118, 1025, 205), "GATS ACADEMY", 30, WHITE, True)

    cards = [
        (BLUE, "HỌC VIÊN", ["Web học viên", "Mobile chỉ cho học viên", "Khóa học & bài học", "Tiến độ đồng bộ", "Chứng chỉ"]),
        (PURPLE, "QUẢN TRỊ", ["Admin panel", "Tạo & xuất bản khóa", "Quản lý giảng viên", "Media", "Báo cáo"]),
        (GREEN, "THƯƠNG MẠI", ["Giỏ hàng", "Đơn hàng", "QR / Chuyển khoản", "SePay PG", "Thẻ & Ví — Kế hoạch"]),
        (RED, "NỀN TẢNG", ["API Backend", "PostgreSQL", "Redis / BullMQ", "MinIO / S3", "Worker video"]),
        (TEAL, "AI / NỘI DUNG", ["Viava", "Sinh khóa học", "Quiz AI", "AI Coach", "Flashcard"]),
        (AMBER, "VẬN HÀNH", ["Docker / PM2", "Nginx / TLS", "Giám sát & cảnh báo", "UAT", "Phát hành Mobile"]),
    ]
    margin, gap = 34, 16
    cw = (W - margin * 2 - gap * 5) // 6
    centers = []
    for i, (color, title, items) in enumerate(cards):
        x = margin + i * (cw + gap)
        centers.append(x + cw // 2)
        rounded(d, (x, 292, x + cw, 850), fill=WHITE, outline=color, radius=18, width=2)
        d.rounded_rectangle((x, 292, x + cw, 365), radius=18, fill=color)
        d.rectangle((x, 340, x + cw, 365), fill=color)
        centered(d, (x, 292, x + cw, 365), title, 19, WHITE, True)
        for j, item in enumerate(items):
            y = 387 + j * 88
            fill = "#FFF7ED" if "Kế hoạch" in item else BG
            rounded(d, (x + 13, y, x + cw - 13, y + 66), fill=fill, outline=LINE, radius=12, width=1)
            centered(d, (x + 20, y, x + cw - 20, y + 66), item, 16, NAVY, "Kế hoạch" in item)
    # Shared bus creates short, non-crossing connectors.
    d.line((centers[0], 250, centers[-1], 250), fill=MUTED, width=3)
    d.line((800, 205, 800, 250), fill=ORANGE, width=4)
    for center, (color, _, _) in zip(centers, cards):
        d.line((center, 250, center, 292), fill=color, width=4)
        d.ellipse((center - 7, 243, center + 7, 257), fill=color)
    return save(im, "02-mindmap.png")


def flow_diagram(title, subtitle, boxes, colors, name, footer=None):
    im, d = canvas(title, subtitle)
    n = len(boxes)
    margin, gap = 45, 28
    bw = (W - margin * 2 - gap * (n - 1)) // n
    y1, y2 = 305, 500
    for i, (text, color) in enumerate(zip(boxes, colors)):
        x1 = margin + i * (bw + gap)
        x2 = x1 + bw
        label_box(d, (x1, y1, x2, y2), text, color, fill=WHITE, size=19, bold=True)
        if i < n - 1:
            arrow(d, (x2 + 5, (y1 + y2) // 2), (x2 + gap - 5, (y1 + y2) // 2), color, 4)
    if footer:
        rounded(d, (90, 610, 1510, 770), fill="#FFF7ED", outline=ORANGE, radius=18, width=2)
        centered(d, (120, 625, 1480, 755), footer, 20, NAVY, False, spacing=9)
    return save(im, name)


def payment_flow():
    return flow_diagram(
        "Luồng mua khóa — thanh toán hiện tại",
        "Đang hoạt động: QR/chuyển khoản và SePay PG khi được bật · VNPay/MoMo/thẻ là kế hoạch",
        [
            "Học viên\nthêm giỏ",
            "API tạo đơn\nPENDING",
            "QR chuyển khoản\nhoặc SePay PG",
            "SePay xác nhận\nwebhook / đối soát",
            "API xử lý\nidempotent",
            "Đơn PAID\n+ cấp quyền học",
        ],
        [GREEN] * 6,
        "03-payment-flow.png",
        "Nếu lệch số tiền hoặc thiếu thông tin: ghi nhận ngoại lệ để Admin xử lý; không tự cấp quyền học.\nKế hoạch mở rộng: VNPay, MoMo, thẻ và ví điện tử sau khi hoàn thiện tích hợp Backend.",
    )


def video_flow():
    return flow_diagram(
        "Luồng Video bài học — từ tải lên đến phát",
        "Video được xử lý nền; học viên chỉ nhận URL phát sau khi API kiểm tra quyền học",
        [
            "Admin lấy URL\ntải lên có chữ ký",
            "Trình duyệt tải\nthẳng S3 / MinIO",
            "API hoàn tất\n+ đưa vào Redis",
            "Worker ffmpeg\nchuyển HLS",
            "Lưu HLS\ntrên S3",
            "API kiểm tra quyền\n→ học viên xem",
        ],
        [BLUE] * 6,
        "04-video-flow.png",
        "Không gọi đây là “URL công khai”: API kiểm tra enrollment/quyền preview trước khi trả playback.\nTiến độ xem được gửi về Backend để Web và Mobile dùng chung.",
    )


def auth_flow():
    im, d = canvas(
        "Luồng đăng nhập — Website và Mobile học viên",
        "Website dùng cookie bảo mật; Mobile dùng access token + refresh token",
    )
    # Input
    label_box(d, (70, 250, 370, 420), "Email / Mật khẩu\nhoặc Google ID token", PURPLE, fill=WHITE, size=21, bold=True)
    arrow(d, (375, 335), (455, 335), PURPLE, 4)
    label_box(d, (460, 250, 760, 420), "Backend xác minh\nthông tin đăng nhập", PURPLE, fill=WHITE, size=21, bold=True)
    arrow(d, (765, 335), (845, 335), PURPLE, 4)
    label_box(d, (850, 250, 1150, 420), "PostgreSQL lưu\nuser + phiên đăng nhập", PURPLE, fill=WHITE, size=21, bold=True)
    d.line((1155, 335, 1240, 335), fill=PURPLE, width=4)
    d.line((1240, 335, 1240, 210), fill=PURPLE, width=4)
    d.line((1240, 335, 1240, 510), fill=PURPLE, width=4)
    arrow(d, (1240, 210), (1310, 210), PURPLE, 4)
    arrow(d, (1240, 510), (1310, 510), PURPLE, 4)
    label_box(d, (1315, 135, 1540, 285), "WEBSITE\nCookie HTTP-only", BLUE, fill="#EFF6FF", size=20, bold=True)
    label_box(d, (1315, 435, 1540, 585), "MOBILE HỌC VIÊN\nAccess + refresh token", GREEN, fill="#ECFDF5", size=19, bold=True)
    rounded(d, (220, 650, 1380, 790), fill="#FFF7ED", outline=ORANGE, radius=18, width=2)
    centered(
        d,
        (250, 665, 1350, 775),
        "Google chỉ cung cấp danh tính; Backend vẫn phải xác minh token trước khi tạo phiên.\nRefresh token Mobile được xoay vòng; đăng xuất sẽ thu hồi phiên.",
        20,
        NAVY,
    )
    return save(im, "05-auth-flow.png")


def deploy_diagram():
    im, d = canvas(
        "Hai cách chạy hệ thống",
        "Local phục vụ phát triển · Production phục vụ người dùng thật trên VPS",
    )
    panels = [
        (
            50,
            GREEN,
            "LOCAL / DEVELOPMENT",
            [
                "Docker: PostgreSQL, Redis, MinIO, Worker",
                "Backend API: localhost:3000",
                "Web học viên: localhost:3005",
                "Admin: localhost:9100 (container :9000)",
                "Có thể chạy full stack bằng container app / PM2",
            ],
        ),
        (
            825,
            ORANGE,
            "PRODUCTION / VPS",
            [
                "Nginx HTTPS: cổng 80/443",
                "gats.vn → Web học viên + /api",
                "admin.gats.vn → Admin dashboard",
                "api.gats.vn → Backend API; /course → Viava",
                "Container app / PM2 chạy API, Worker, Web, Admin, Viava",
                "PostgreSQL, Redis và MinIO không mở ra Internet",
                "Mobile học viên gọi API qua HTTPS",
            ],
        ),
    ]
    for x, color, title, items in panels:
        rounded(d, (x, 145, x + 725, 835), fill=WHITE, outline=color, radius=22, width=3)
        d.text((x + 32, 180), title, font=font(25, True), fill=color)
        for i, item in enumerate(items):
            y = 250 + i * 76
            d.ellipse((x + 35, y + 8, x + 47, y + 20), fill=color)
            d.text((x + 65, y), item, font=font(18), fill=NAVY)
    return save(im, "06-deploy.png")


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def add_table(doc, rows):
    table = doc.add_table(rows=1, cols=3)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, text in enumerate(("Thành phần", "Vai trò", "Cổng / địa chỉ")):
        cell = table.rows[0].cells[i]
        cell.text = text
        shade_cell(cell, "10243E")
        for run in cell.paragraphs[0].runs:
            run.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
    for row in rows:
        cells = table.add_row().cells
        for i, text in enumerate(row):
            cells[i].text = text
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    return table


def build_doc(images):
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Cm(1.8)
    section.bottom_margin = Cm(1.8)
    section.left_margin = Cm(2)
    section.right_margin = Cm(2)
    styles = doc.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(10.5)
    for name, size, color in (("Title", 25, NAVY[1:]), ("Heading 1", 17, NAVY[1:]), ("Heading 2", 13, ORANGE[1:])):
        styles[name].font.name = "Arial"
        styles[name].font.size = Pt(size)
        styles[name].font.bold = True
        styles[name].font.color.rgb = RGBColor.from_string(color)

    title = doc.add_paragraph(style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.add_run("GATS Academy\nSơ đồ kiến trúc hệ thống")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("Tài liệu nội bộ · Cập nhật 04/08/2026").italic = True

    doc.add_heading("1. Kiến trúc hệ thống hiện tại", level=1)
    doc.add_paragraph(
        "Ba kênh sử dụng gồm Website học viên, Mobile chỉ dành cho học viên và Admin dashboard. "
        "Ở production, Nginx nhận toàn bộ kết nối HTTPS rồi chuyển đến các dịch vụ phù hợp. "
        "Backend là nguồn dữ liệu chung cho Web và Mobile."
    )
    doc.add_picture(str(images[0]), width=Inches(7.1))

    doc.add_heading("2. Bản đồ miền chức năng", level=1)
    doc.add_paragraph(
        "Sơ đồ phân chia hệ thống thành sáu miền. Mục “Thẻ & Ví — Kế hoạch” chưa phải chức năng production; "
        "hiện thanh toán chính là QR/chuyển khoản và SePay PG khi được cấu hình. Mobile không có chức năng Admin hoặc Mentor."
    )
    doc.add_picture(str(images[1]), width=Inches(7.1))

    doc.add_heading("3. Thành phần và địa chỉ", level=1)
    add_table(
        doc,
        [
            ("Backend API", "Nguồn dữ liệu và nghiệp vụ chung", "Nội bộ :3000 · api.gats.vn"),
            ("Web học viên", "Khám phá, mua và học", "Nội bộ :3005 · gats.vn"),
            ("Admin dashboard", "Quản trị nội dung và vận hành", "Nội bộ :9000 · local :9100 · admin.gats.vn"),
            ("Mobile học viên", "Ứng dụng học tập iOS/Android", "HTTPS đến API"),
            ("Viava AI", "Sinh nội dung, bài tập và AI", "Nội bộ :8000 · api.gats.vn/course"),
            ("Nginx", "TLS và điều hướng production", "80 / 443"),
            ("PostgreSQL", "Dữ liệu nghiệp vụ", "Nội bộ :5432"),
            ("Redis / BullMQ", "Cache và hàng đợi", "Nội bộ :6379"),
            ("MinIO", "Ảnh, tài liệu và file", "Nội bộ :9000; console không public"),
            ("S3 Video", "Video gốc, HLS và URL upload", "Endpoint cấu hình theo môi trường"),
        ],
    )

    doc.add_heading("4. Các luồng nghiệp vụ chính", level=1)
    doc.add_heading("4.1 Thanh toán và cấp quyền học", level=2)
    doc.add_paragraph(
        "Đơn chỉ chuyển sang đã thanh toán và cấp quyền học sau khi Backend xác minh thông tin thanh toán. "
        "VNPay, MoMo, thẻ và ví điện tử chưa hoàn thiện, vì vậy được ghi là kế hoạch thay vì chức năng hiện tại."
    )
    doc.add_picture(str(images[2]), width=Inches(7.1))

    doc.add_heading("4.2 Video bài học", level=2)
    doc.add_paragraph(
        "Admin tải video trực tiếp lên vùng lưu trữ bằng URL có chữ ký. Worker xử lý video thành HLS. "
        "Trước khi trả thông tin phát, Backend kiểm tra học viên có quyền học hoặc bài được phép xem thử."
    )
    doc.add_picture(str(images[3]), width=Inches(7.1))

    doc.add_heading("4.3 Đăng nhập", level=2)
    doc.add_paragraph(
        "Website dùng cookie HTTP-only; Mobile học viên dùng access token và refresh token lưu trong vùng bảo mật của thiết bị. "
        "Đăng nhập Google vẫn phải được Backend xác minh trước khi tạo phiên."
    )
    doc.add_picture(str(images[4]), width=Inches(7.1))

    doc.add_heading("5. Local và Production", level=1)
    doc.add_paragraph(
        "Local cho phép mở cổng phục vụ phát triển. Production chỉ mở Nginx 80/443; PostgreSQL, Redis và MinIO không mở trực tiếp ra Internet."
    )
    doc.add_picture(str(images[5]), width=Inches(7.1))

    doc.add_heading("6. Hiện trạng và kế hoạch", level=1)
    add_table(
        doc,
        [
            ("Đang hoạt động", "Web, Admin, Mobile learner, Backend, PostgreSQL, Redis, MinIO/S3, Worker, Viava", "Production/staging cần UAT"),
            ("Thanh toán hiện tại", "QR/chuyển khoản; SePay PG khi bật", "Cần đối soát và cảnh báo"),
            ("Thanh toán kế hoạch", "VNPay, MoMo, thẻ và ví điện tử", "Chưa coi là production-ready"),
            ("Mobile", "Chỉ dành cho học viên", "Không phát hành Admin/Mentor"),
        ],
    )

    doc.add_heading("7. Tóm tắt", level=1)
    doc.add_paragraph(
        "GATS Academy gồm Website học viên, Admin dashboard và Mobile học viên dùng chung Backend API. "
        "Backend kết nối PostgreSQL, Redis/BullMQ, MinIO/S3, Worker video, Viava AI và các dịch vụ bên ngoài. "
        "Production đi qua Nginx HTTPS; dữ liệu và hàng đợi không mở trực tiếp ra Internet."
    )

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.add_run("GATS Academy — Kiến trúc hệ thống · 04/08/2026").font.size = Pt(8)
    doc.core_properties.title = "GATS Academy — Sơ đồ kiến trúc hệ thống"
    doc.core_properties.author = "GATS Academy"
    doc.save(DOCX)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    images = [
        architecture_layers(),
        mindmap(),
        payment_flow(),
        video_flow(),
        auth_flow(),
        deploy_diagram(),
    ]
    build_doc(images)
    print(DOCX)


if __name__ == "__main__":
    main()
