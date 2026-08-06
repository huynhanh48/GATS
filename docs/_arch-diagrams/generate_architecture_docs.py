from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "_arch-diagrams"
DOCX = ROOT / "docs" / "so-do-kien-truc-he-thong-5-cap.docx"
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
        "GATS Academy — Kiến trúc hệ thống",
        "Phạm vi production · Mobile chỉ dành cho học viên · Mọi truy cập công khai đi qua HTTPS",
    )

    # External actors — placed outside the system boundary.
    d.text((35, 130), "TÁC NHÂN", font=font(18, True), fill=BLUE)
    actors = [
        ("Học viên", "Web / Mobile"),
        ("Quản trị viên", "Admin dashboard"),
        ("Giảng viên", "Quản lý nội dung"),
    ]
    for i, (name, sub) in enumerate(actors):
        y = 170 + i * 135
        rounded(d, (30, y, 220, y + 92), fill="#EFF6FF", outline=BLUE, radius=16)
        centered(d, (40, y + 8, 210, y + 48), name, 18, NAVY, True)
        centered(d, (40, y + 47, 210, y + 80), sub, 14, MUTED)

    # GATS trust boundary.
    rounded(d, (255, 122, 1245, 842), fill=WHITE, outline=NAVY, radius=18, width=3)
    d.rectangle((255, 122, 1245, 164), fill=NAVY)
    d.text((275, 131), "PHẠM VI HỆ THỐNG GATS ACADEMY", font=font(19, True), fill=WHITE)
    d.text((1005, 134), "VPS / Docker / PM2", font=font(14), fill="#D9E2EC")

    # Access channels.
    d.text((278, 180), "1. KÊNH TRUY CẬP", font=font(16, True), fill=BLUE)
    channels = [
        ("Web học viên", "Next.js · :3005"),
        ("Mobile học viên", "Flutter · iOS/Android"),
        ("Admin dashboard", "Next.js · :9000"),
    ]
    channel_centers = []
    for i, (name, sub) in enumerate(channels):
        x = 278 + i * 315
        channel_centers.append(x + 140)
        rounded(d, (x, 207, x + 280, 278), fill="#EFF6FF", outline=BLUE, radius=13)
        d.text((x + 15, 221), name, font=font(17, True), fill=NAVY)
        d.text((x + 15, 250), sub, font=font(13), fill=MUTED)

    # Security and routing boundary.
    d.text((278, 290), "2. CỔNG TRUY CẬP & BẢO MẬT", font=font(16, True), fill=ORANGE)
    rounded(d, (375, 312, 1125, 376), fill="#FFF7ED", outline=ORANGE, radius=14, width=2)
    centered(d, (385, 315, 1115, 373), "NGINX · TLS 80/443 · Reverse proxy · Routing theo domain", 17, NAVY, True)
    for center in channel_centers:
        arrow(d, (center, 278), (center, 312), BLUE, 3)

    # Core services.
    d.text((278, 399), "3. ỨNG DỤNG & NGHIỆP VỤ LÕI", font=font(16, True), fill=GREEN)
    core = [
        ("Backend API", "Express :3000\nAuth · Khóa học · Tiến độ"),
        ("Thương mại", "Đơn hàng · Thanh toán\nEnrollment · Chứng chỉ"),
        ("Nội dung & Media", "Bài viết · Upload\nVideo playback"),
        ("Viava AI", "FastAPI :8000\nQuiz · Coach · Flashcard"),
    ]
    core_centers = []
    for i, (name, sub) in enumerate(core):
        x = 278 + i * 235
        core_centers.append(x + 105)
        rounded(d, (x, 428, x + 210, 525), fill="#ECFDF5", outline=GREEN, radius=13)
        centered(d, (x + 8, 435, x + 202, 466), name, 17, NAVY, True)
        centered(d, (x + 8, 468, x + 202, 516), sub, 13, MUTED)
    arrow(d, (750, 376), (750, 428), ORANGE, 3)
    d.line((core_centers[0], 405, core_centers[-1], 405), fill=ORANGE, width=3)
    for center in core_centers:
        d.line((center, 405, center, 428), fill=ORANGE, width=3)

    # Async processing.
    d.text((278, 550), "4. TÍCH HỢP, AI & XỬ LÝ NỀN", font=font(16, True), fill=TEAL)
    async_boxes = [
        ("Redis / BullMQ", "Cache · Hàng đợi"),
        ("Video Worker", "ffmpeg · HLS"),
        ("Thông báo", "Email · Push"),
    ]
    for i, (name, sub) in enumerate(async_boxes):
        x = 278 + i * 305
        rounded(d, (x, 578, x + 270, 646), fill="#ECFEFF", outline=TEAL, radius=13)
        d.text((x + 15, 591), name, font=font(16, True), fill=NAVY)
        d.text((x + 15, 619), sub, font=font(13), fill=MUTED)
    arrow(d, (750, 525), (750, 555), GREEN, 3)
    d.line((413, 555, 1023, 555), fill=GREEN, width=3)
    for center in (413, 718, 1023):
        d.line((center, 555, center, 578), fill=GREEN, width=3)

    # Data layer.
    d.text((278, 658), "5. DỮ LIỆU & HẠ TẦNG", font=font(16, True), fill=PURPLE)
    data = [
        ("PostgreSQL", "Nghiệp vụ"),
        ("MinIO", "Ảnh · Tài liệu"),
        ("S3 Video", "Video gốc · HLS"),
    ]
    for i, (name, sub) in enumerate(data):
        x = 278 + i * 305
        rounded(d, (x, 704, x + 270, 775), fill="#F5F3FF", outline=PURPLE, radius=13)
        d.text((x + 15, 718), name, font=font(16, True), fill=NAVY)
        d.text((x + 15, 746), sub, font=font(13), fill=MUTED)
    d.text((1050, 674), "Data access bus", font=font(11, True), fill=MUTED)
    d.line((413, 688, 1215, 688), fill=PURPLE, width=3)
    d.line((1193, 525, 1215, 525), fill=PURPLE, width=3)
    d.line((1215, 525, 1215, 688), fill=PURPLE, width=3)
    d.line((718, 646, 718, 688), fill=PURPLE, width=3)
    for center in (413, 718, 1023):
        arrow(d, (center, 688), (center, 704), PURPLE, 3)

    # External providers.
    d.text((1280, 130), "DỊCH VỤ BÊN NGOÀI", font=font(18, True), fill=AMBER)
    providers = [
        ("Google OAuth", "Đăng nhập"),
        ("SePay", "QR · PG · Webhook"),
        ("FCM / SMTP", "Push · Email"),
        ("Azure / Tavily", "AI · Tìm kiếm"),
        ("Qdrant", "Vector database"),
    ]
    for i, (name, sub) in enumerate(providers):
        y = 170 + i * 119
        rounded(d, (1275, y, 1565, y + 82), fill="#FFFBEB", outline=AMBER, radius=14)
        d.text((1292, y + 15), name, font=font(16, True), fill=NAVY)
        d.text((1292, y + 48), sub, font=font(13), fill=MUTED)

    # Labeled integration lines, inspired by the reference architecture.
    integrations = [
        ((1245, 211), (1275, 211), "OIDC"),
        ((1245, 330), (1275, 330), "HTTPS"),
        ((1245, 449), (1275, 449), "API"),
        ((1245, 568), (1275, 568), "REST"),
        ((1245, 687), (1275, 687), "Vector"),
    ]
    for start, end, protocol in integrations:
        arrow(d, start, end, AMBER, 2)
        d.text((1247, start[1] - 18), protocol, font=font(10, True), fill=MUTED)

    # Actor connections to public channels.
    arrow(d, (220, 216), (255, 216), BLUE, 3)
    arrow(d, (220, 351), (255, 351), BLUE, 3)
    arrow(d, (220, 486), (255, 486), BLUE, 3)

    # Legend.
    d.text((280, 804), "Luồng chính", font=font(12, True), fill=MUTED)
    d.line((365, 812, 415, 812), fill=BLUE, width=3)
    d.text((430, 804), "Tích hợp bên thứ ba", font=font(12, True), fill=MUTED)
    d.line((570, 812, 620, 812), fill=AMBER, width=3)
    d.text((635, 804), "Ranh giới tin cậy: chỉ Nginx công khai; dữ liệu không mở Internet", font=font(12), fill=MUTED)
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


def add_matrix_table(doc, headers, rows, header_fill="1F3A5F"):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, text in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = text
        shade_cell(cell, header_fill)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for run in cell.paragraphs[0].runs:
            run.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(9.5)
    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for i, text in enumerate(row):
            cells[i].text = text
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if row_index % 2 == 1:
                shade_cell(cells[i], "F4F7FA")
            for paragraph in cells[i].paragraphs:
                paragraph.paragraph_format.space_after = Pt(2)
                for run in paragraph.runs:
                    run.font.size = Pt(9)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run("Trang ")
    fld_char_1 = OxmlElement("w:fldChar")
    fld_char_1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = "PAGE"
    fld_char_2 = OxmlElement("w:fldChar")
    fld_char_2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char_1)
    run._r.append(instr_text)
    run._r.append(fld_char_2)


def add_toc(doc):
    paragraph = doc.add_paragraph()
    run = paragraph.add_run()
    fld_char = OxmlElement("w:fldChar")
    fld_char.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = 'TOC \\o "1-3" \\h \\z \\u'
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "Nhấn chuột phải và chọn Update Field để cập nhật mục lục."
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char, instr_text, fld_sep, placeholder, fld_end])


def build_doc(images):
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)
    styles = doc.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(10.5)
    styles["Normal"].paragraph_format.space_after = Pt(6)
    styles["Normal"].paragraph_format.line_spacing = 1.15
    for name, size, color in (
        ("Title", 26, "1F3A5F"),
        ("Heading 1", 18, "1F3A5F"),
        ("Heading 2", 14, "1F3A5F"),
        ("Heading 3", 12, "2E5E8C"),
    ):
        styles[name].font.name = "Arial"
        styles[name].font.size = Pt(size)
        styles[name].font.bold = True
        styles[name].font.color.rgb = RGBColor.from_string(color)

    # Cover page.
    doc.add_paragraph("\n\n\n")
    cover = doc.add_paragraph()
    cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = cover.add_run("GATS ACADEMY")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(30)
    run.font.color.rgb = RGBColor.from_string("FF7622")
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = subtitle.add_run("TÀI LIỆU MÔ TẢ KIẾN TRÚC HỆ THỐNG")
    r.bold = True
    r.font.size = Pt(24)
    r.font.color.rgb = RGBColor.from_string("1F3A5F")
    model = doc.add_paragraph()
    model.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = model.add_run("MÔ HÌNH KIẾN TRÚC 5 CẤP")
    r.bold = True
    r.font.size = Pt(18)
    r.font.color.rgb = RGBColor.from_string("2E5E8C")
    doc.add_paragraph("\n")
    info = add_matrix_table(
        doc,
        ("Thông tin", "Nội dung"),
        [
            ("Tên hệ thống", "Nền tảng đào tạo trực tuyến GATS Academy"),
            ("Phiên bản tài liệu", "1.0"),
            ("Ngày cập nhật", "04/08/2026"),
            ("Phạm vi", "Web học viên, Mobile học viên, Admin, Backend, Viava AI và hạ tầng production"),
            ("Trạng thái", "Tài liệu kiến trúc hiện trạng và định hướng hoàn thiện"),
        ],
    )
    doc.add_paragraph("\n")
    notice = doc.add_paragraph()
    notice.alignment = WD_ALIGN_PARAGRAPH.CENTER
    notice.add_run("TÀI LIỆU NỘI BỘ").bold = True
    doc.add_page_break()

    doc.add_heading("Lịch sử phiên bản", level=1)
    add_matrix_table(
        doc,
        ("Phiên bản", "Ngày", "Nội dung thay đổi", "Người thực hiện"),
        [("1.0", "04/08/2026", "Xây dựng tài liệu kiến trúc 5 cấp cho GATS Academy", "GATS Academy")],
    )
    doc.add_heading("Mục lục", level=1)
    add_toc(doc)
    doc.add_page_break()

    doc.add_heading("1. Giới thiệu", level=1)
    doc.add_paragraph(
        "Tài liệu mô tả kiến trúc tổng thể của GATS Academy theo mô hình 5 cấp, từ lớp trải nghiệm người dùng "
        "đến lớp dữ liệu và hạ tầng vận hành. Mỗi cấp có trách nhiệm riêng, giao tiếp qua các giao diện xác định "
        "và cùng sử dụng Backend API làm nguồn nghiệp vụ thống nhất."
    )
    doc.add_paragraph("Mục tiêu của tài liệu:")
    for text in (
        "Mô tả tổng thể: trình bày ranh giới hệ thống, tác nhân, dịch vụ nội bộ và nhà cung cấp bên ngoài.",
        "Mô tả chi tiết: nêu chức năng, trách nhiệm và công nghệ của từng thành phần trong 5 cấp.",
        "Luồng liên kết: làm rõ luồng đăng nhập, mua khóa học, học tập, video, AI Coach và thông báo.",
        "Vận hành: xác định cổng dịch vụ, vùng dữ liệu, nguyên tắc bảo mật và các điểm còn yếu cần hoàn thiện.",
    ):
        doc.add_paragraph(text, style="List Bullet")

    doc.add_heading("1.1. Phạm vi", level=2)
    doc.add_paragraph(
        "Phạm vi bao gồm Website học viên, ứng dụng Mobile chỉ dành cho học viên, Admin dashboard, Backend API, "
        "Viava AI, Worker xử lý video, PostgreSQL, Redis/BullMQ, MinIO/S3 và các tích hợp Google, SePay, FCM, SMTP, Azure/Tavily/Qdrant."
    )
    doc.add_heading("1.2. Nguyên tắc kiến trúc", level=2)
    for text in (
        "Một nguồn nghiệp vụ: Web và Mobile sử dụng chung Backend API.",
        "Phân tách trách nhiệm: giao diện, nghiệp vụ, xử lý nền và dữ liệu được tách thành các cấp rõ ràng.",
        "Bảo mật theo ranh giới: production chỉ công khai Nginx qua HTTPS; dịch vụ dữ liệu nằm trong mạng nội bộ.",
        "Tích hợp có kiểm soát: khóa bí mật và kết nối bên thứ ba được giữ ở Backend, không nhúng vào Mobile/Web client.",
        "Khả năng mở rộng: tác vụ nặng được đẩy sang Redis/BullMQ và Worker thay vì chặn request người dùng.",
    ):
        doc.add_paragraph(text, style="List Bullet")

    doc.add_heading("1.3. Tổng quan mô hình 5 cấp", level=2)
    add_matrix_table(
        doc,
        ("Cấp", "Tên gọi", "Vai trò tóm tắt"),
        [
            ("Cấp 1", "Trải nghiệm và kênh người dùng", "Web học viên, Mobile học viên và Admin dashboard; tiếp nhận thao tác của người dùng theo đúng vai trò."),
            ("Cấp 2", "Cổng truy cập và bảo mật", "DNS, Nginx, TLS, reverse proxy, xác thực và phân quyền; là ranh giới công khai của production."),
            ("Cấp 3", "Ứng dụng và nghiệp vụ lõi", "Backend API và các miền khóa học, học tập, nội dung, thương mại, thanh toán, người dùng và thông báo."),
            ("Cấp 4", "Tích hợp, AI và xử lý nền", "Redis/BullMQ, Video Worker, Viava AI và các tích hợp Google, SePay, FCM/SMTP, Azure/Tavily/Qdrant."),
            ("Cấp 5", "Dữ liệu và hạ tầng", "PostgreSQL, MinIO, S3 Video, volume, container, PM2 và môi trường VPS phục vụ lưu trữ/vận hành."),
        ],
    )

    # Landscape section for the overall diagram, matching the reference report.
    landscape = doc.add_section(WD_SECTION.NEW_PAGE)
    landscape.orientation = WD_ORIENT.LANDSCAPE
    landscape.page_width, landscape.page_height = landscape.page_height, landscape.page_width
    landscape.top_margin = Cm(1.5)
    landscape.bottom_margin = Cm(1.5)
    landscape.left_margin = Cm(1.5)
    landscape.right_margin = Cm(1.5)
    doc.add_heading("2. Sơ đồ kiến trúc tổng thể", level=1)
    doc.add_paragraph(
        "Hình 2.1 thể hiện năm cấp kiến trúc, các tác nhân bên ngoài, ranh giới tin cậy và các dịch vụ tích hợp của GATS Academy."
    )
    picture = doc.add_picture(str(images[0]), width=Inches(9.8))
    picture._inline.graphic.graphicData.pic.spPr.xfrm.off.x = 0
    caption = doc.add_paragraph("Hình 2.1 — Mô hình kiến trúc hệ thống GATS Academy 5 cấp")
    caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
    caption.runs[0].italic = True

    portrait = doc.add_section(WD_SECTION.NEW_PAGE)
    portrait.orientation = WD_ORIENT.PORTRAIT
    portrait.page_width, portrait.page_height = portrait.page_height, portrait.page_width
    portrait.top_margin = Cm(2)
    portrait.bottom_margin = Cm(2)
    portrait.left_margin = Cm(2.2)
    portrait.right_margin = Cm(2.2)

    doc.add_heading("3. Mô tả chi tiết chức năng, nhiệm vụ theo từng cấp", level=1)
    doc.add_heading("3.1. Cấp 1 — Trải nghiệm và kênh người dùng", level=2)
    doc.add_paragraph(
        "Cấp 1 là điểm tương tác trực tiếp với người sử dụng. Các kênh không tự truy cập cơ sở dữ liệu mà gọi Backend qua HTTPS. "
        "Mobile chỉ phục vụ học viên; các tác vụ quản trị và giảng dạy được thực hiện trên Web/Admin theo phân quyền."
    )
    add_matrix_table(doc, ("Thành phần", "Chức năng, nhiệm vụ"), [
        ("Web học viên (Next.js :3005)", "Khám phá khóa học, đăng ký/đăng nhập, mua khóa, học trực tuyến, theo dõi tiến độ, đánh giá và quản lý hồ sơ."),
        ("Mobile học viên (Flutter)", "Học bài, xem video, quiz/flashcard, ghi chú, Q&A, thông báo và AI Coach. Không cung cấp chức năng Admin/Mentor."),
        ("Admin dashboard (Next.js :9000)", "Quản trị khóa học, bài học, người dùng, nội dung, media, đơn hàng, thanh toán và vận hành hệ thống."),
        ("Tác nhân", "Học viên sử dụng Web/Mobile; Quản trị viên và Giảng viên sử dụng các giao diện được phân quyền."),
    ])

    doc.add_heading("3.2. Cấp 2 — Cổng truy cập và bảo mật", level=2)
    doc.add_paragraph(
        "Cấp 2 là ranh giới tin cậy giữa Internet và hệ thống nội bộ. Nginx tiếp nhận kết nối công khai, kết thúc TLS và định tuyến đến đúng ứng dụng."
    )
    add_matrix_table(doc, ("Thành phần", "Chức năng, nhiệm vụ"), [
        ("DNS và tên miền", "gats.vn phục vụ Web; admin.gats.vn phục vụ Admin; api.gats.vn phục vụ Backend API và route tích hợp được cấu hình."),
        ("Nginx / TLS", "Mở cổng 80/443, chuyển HTTP sang HTTPS, reverse proxy, chuyển tiếp header và tách route theo domain/path."),
        ("Xác thực", "Email/mật khẩu hoặc Google ID token. Backend xác minh danh tính trước khi cấp phiên/token."),
        ("Phân quyền", "Backend kiểm tra vai trò và quyền ở từng API; việc ẩn nút trên giao diện không thay thế kiểm tra quyền phía server."),
        ("Phiên Web/Mobile", "Web ưu tiên cookie HTTP-only; Mobile sử dụng access token và refresh token lưu trong secure storage."),
    ])

    doc.add_heading("3.3. Cấp 3 — Ứng dụng và nghiệp vụ lõi", level=2)
    doc.add_paragraph(
        "Cấp 3 tập trung nghiệp vụ dùng chung. Backend Express :3000 là nguồn dữ liệu và quyết định nghiệp vụ cho cả Web, Mobile và Admin."
    )
    add_matrix_table(doc, ("Miền nghiệp vụ", "Chức năng, nhiệm vụ"), [
        ("Người dùng & danh tính", "Tài khoản, hồ sơ, vai trò, phiên đăng nhập, refresh token và liên kết đăng nhập Google."),
        ("Khóa học & nội dung", "Danh mục, khóa học, chương, bài học, bài viết, giảng viên, trạng thái xuất bản và nội dung rich text."),
        ("Học tập", "Enrollment, quyền xem bài, tiến độ, quiz, bài tập, flashcard, ghi chú, bookmark, Q&A, đánh giá và chứng chỉ."),
        ("Thương mại", "Giỏ hàng, đơn hàng, coupon, giá, trạng thái thanh toán và cấp quyền học sau khi giao dịch hợp lệ."),
        ("Thanh toán", "QR/chuyển khoản và SePay PG khi cấu hình; webhook/đối soát phải idempotent. VNPay, MoMo, thẻ và ví chưa hoàn thiện."),
        ("Thông báo & thiết bị", "Lưu thông báo, đăng ký thiết bị Mobile, tùy chọn nhận tin và phối hợp FCM/SMTP."),
        ("AI Coach session", "Mobile gửi câu hỏi qua Backend; Backend gọi Viana /course/chat để không lộ cấu hình dịch vụ AI."),
    ])

    doc.add_heading("3.4. Cấp 4 — Tích hợp, AI và xử lý bất đồng bộ", level=2)
    doc.add_paragraph(
        "Cấp 4 xử lý các công việc có độ trễ cao hoặc phụ thuộc hệ thống bên ngoài, giúp request nghiệp vụ chính không bị chặn kéo dài."
    )
    add_matrix_table(doc, ("Thành phần", "Chức năng, nhiệm vụ"), [
        ("Redis / BullMQ", "Cache, hàng đợi và điều phối job nền; không được mở trực tiếp ra Internet."),
        ("Video Worker / ffmpeg", "Nhận job sau upload, chuyển video sang HLS, cập nhật kết quả và trạng thái xử lý."),
        ("Viava AI (FastAPI :8000)", "Sinh khóa học, bài tập, quiz, flashcard và phản hồi AI Coach; Backend đóng vai trò proxy/điều phối."),
        ("Google OAuth", "Cung cấp danh tính Google; Backend xác minh ID token và ánh xạ tài khoản GATS."),
        ("SePay", "Tạo/hiển thị luồng thanh toán phù hợp, nhận webhook và đối soát trạng thái giao dịch."),
        ("FCM / SMTP", "Gửi push notification và email; lỗi gửi không được làm mất dữ liệu nghiệp vụ chính."),
        ("Azure / Tavily / Qdrant", "Dịch vụ AI, tìm kiếm và vector store được Viava/Backend sử dụng theo cấu hình môi trường."),
    ])

    doc.add_heading("3.5. Cấp 5 — Dữ liệu và hạ tầng", level=2)
    doc.add_paragraph(
        "Cấp 5 lưu trữ trạng thái bền vững và cung cấp môi trường chạy dịch vụ. Production triển khai trên VPS bằng Docker/PM2 và chỉ công khai Nginx."
    )
    add_matrix_table(doc, ("Thành phần", "Chức năng, nhiệm vụ"), [
        ("PostgreSQL :5432", "Lưu dữ liệu nghiệp vụ: tài khoản, khóa học, đơn hàng, enrollment, tiến độ, nội dung và cấu hình liên quan."),
        ("MinIO :9000", "Lưu ảnh, tài liệu và file ứng dụng; console quản trị không công khai ra Internet."),
        ("S3 Video", "Lưu video gốc, đầu ra HLS và hỗ trợ upload bằng URL có chữ ký."),
        ("Docker network / volume", "Cô lập kết nối nội bộ và duy trì dữ liệu qua volume; cần sao lưu độc lập với vòng đời container."),
        ("PM2 / container app", "Quản lý tiến trình Web, Admin, Backend, Worker và Viava tùy cấu hình triển khai."),
        ("VPS", "Máy chủ production; là điểm tập trung hiện tại nên cần giám sát, backup và kế hoạch phục hồi sự cố."),
    ])

    doc.add_heading("4. Bản đồ miền chức năng", level=1)
    doc.add_paragraph(
        "Các miền chức năng được nhóm theo học viên, quản trị, thương mại, nền tảng, AI/nội dung và vận hành. Nhãn “Kế hoạch” không được hiểu là chức năng production hiện có."
    )
    doc.add_picture(str(images[1]), width=Inches(7.1))

    doc.add_heading("5. Luồng dữ liệu và nghiệp vụ chính giữa các cấp", level=1)
    add_matrix_table(doc, ("Luồng", "Mô tả liên kết giữa các cấp"), [
        ("Đăng nhập", "Cấp 1 gửi thông tin đăng nhập qua Cấp 2; Cấp 3 xác minh, đọc/ghi phiên tại Cấp 5 và có thể gọi Google ở Cấp 4."),
        ("Mua và cấp quyền học", "Cấp 1 tạo đơn; Cấp 3 điều phối thanh toán; Cấp 4 nhận xác nhận SePay; Cấp 3 cập nhật PAID và enrollment tại Cấp 5."),
        ("Học và đồng bộ tiến độ", "Web/Mobile gửi sự kiện học qua HTTPS; Backend kiểm tra quyền, lưu tiến độ vào PostgreSQL và trả trạng thái thống nhất cho các thiết bị."),
        ("Video", "Admin lấy URL upload; file đi thẳng storage; Backend tạo job Redis/BullMQ; Worker chuyển HLS; Backend kiểm tra enrollment trước khi trả playback."),
        ("AI Coach", "Mobile gửi query đến Backend; Backend gọi Viana POST /course/chat; câu trả lời được trả về session giao diện mà không lộ endpoint/secret AI."),
        ("Thông báo", "Backend ghi sự kiện nghiệp vụ, tạo notification và giao Cấp 4 gửi FCM/SMTP; trạng thái nghiệp vụ không phụ thuộc tuyệt đối vào việc gửi thành công."),
    ])

    doc.add_heading("5.1. Thanh toán và cấp quyền học", level=2)
    doc.add_picture(str(images[2]), width=Inches(7.1))
    doc.add_heading("5.2. Video bài học", level=2)
    doc.add_picture(str(images[3]), width=Inches(7.1))
    doc.add_heading("5.3. Đăng nhập Web và Mobile", level=2)
    doc.add_picture(str(images[4]), width=Inches(7.1))

    doc.add_heading("6. Kiến trúc triển khai", level=1)
    doc.add_paragraph(
        "Môi trường local có thể mở thêm cổng phục vụ phát triển. Production chỉ công khai Nginx 80/443; các dịch vụ ứng dụng và dữ liệu trao đổi qua mạng nội bộ."
    )
    doc.add_picture(str(images[5]), width=Inches(7.1))
    add_matrix_table(doc, ("Môi trường", "Đặc điểm", "Yêu cầu"), [
        ("Local / Development", "Chạy từng dịch vụ hoặc Docker Compose; dùng localhost và cổng phát triển.", "Không dùng secret production; dữ liệu thử nghiệm tách biệt."),
        ("Production / VPS", "Nginx HTTPS phía trước; ứng dụng và dữ liệu trong Docker/internal network.", "Backup, health check, log tập trung, cảnh báo và quy trình rollback."),
    ])

    doc.add_heading("7. Yêu cầu phi chức năng và điểm cần hoàn thiện", level=1)
    add_matrix_table(doc, ("Nhóm", "Hiện trạng / điểm yếu", "Khuyến nghị"), [
        ("Tính sẵn sàng", "Nhiều thành phần tập trung trên một VPS có thể tạo điểm lỗi đơn.", "Thiết lập health check, restart policy, backup ngoài máy và kế hoạch khôi phục."),
        ("Quan sát hệ thống", "Chưa thể hiện đầy đủ log tập trung, metric và cảnh báo production.", "Bổ sung monitoring, error tracking, dashboard và cảnh báo dung lượng/CPU/job lỗi."),
        ("Thanh toán", "Thiếu đa dạng phương thức; chủ yếu QR/chuyển khoản và SePay PG khi bật.", "Mở rộng VNPay, MoMo, thẻ/ví sau khi hoàn thiện webhook, đối soát và UAT."),
        ("Bảo mật", "Nhiều tích hợp và token cần được quản lý nhất quán.", "Quản lý secret theo môi trường, xoay khóa, rate limit, audit log và rà soát phân quyền."),
        ("Dữ liệu", "Volume/container không thay thế chiến lược backup.", "Backup PostgreSQL và object storage định kỳ; kiểm thử restore và quy định thời gian lưu."),
        ("AI", "Phụ thuộc độ sẵn sàng/chất lượng của Viana và nhà cung cấp ngoài.", "Timeout, retry có giới hạn, circuit breaker, log truy vết và thông báo fallback rõ ràng."),
        ("Mobile", "Chỉ dành cho learner và phụ thuộc phiên bản API đang triển khai.", "Version API, kiểm thử thiết bị thật, theo dõi crash và quy trình phát hành store."),
    ])

    doc.add_heading("8. Kết luận", level=1)
    doc.add_paragraph(
        "Kiến trúc GATS Academy được tổ chức thành 5 cấp với ranh giới rõ ràng: Cấp 1 cung cấp trải nghiệm; "
        "Cấp 2 bảo vệ và điều hướng truy cập; Cấp 3 thực thi nghiệp vụ lõi; Cấp 4 xử lý AI, tích hợp và tác vụ nền; "
        "Cấp 5 lưu dữ liệu và vận hành hạ tầng. Mô hình này giúp Web và Mobile dùng chung dữ liệu, bảo vệ dịch vụ nội bộ "
        "và tạo nền tảng để mở rộng thanh toán, quan sát hệ thống và khả năng phục hồi trong các giai đoạn tiếp theo."
    )

    for current_section in doc.sections:
        current_section.footer.is_linked_to_previous = False
        footer = current_section.footer.paragraphs[0]
        footer.clear()
        footer.add_run("GATS Academy — Tài liệu mô tả kiến trúc hệ thống 5 cấp · ").font.size = Pt(8)
        add_page_number(footer)
    doc.core_properties.title = "GATS Academy — Sơ đồ kiến trúc hệ thống"
    doc.core_properties.author = "GATS Academy"
    doc.core_properties.subject = "Tài liệu mô tả kiến trúc hệ thống 5 cấp"
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
