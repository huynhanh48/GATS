from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches


ROOT = Path(__file__).resolve().parents[1]
DOC_PATH = ROOT / "docs" / "so-do-kien-truc-he-thong-5-cap.docx"
BACKUP_PATH = ROOT / "docs" / "so-do-kien-truc-he-thong-5-cap-before-v1.1.docx"


def set_paragraph(document: Document, starts_with: str, value: str) -> None:
    for paragraph in document.paragraphs:
        if paragraph.text.strip().startswith(starts_with):
            paragraph.text = value
            return
    # Cho phép chạy lại script trên tài liệu đã được đồng bộ.
    if any(paragraph.text.strip() == value for paragraph in document.paragraphs):
        return
    raise ValueError(f"Không tìm thấy đoạn bắt đầu bằng: {starts_with}")


def set_cell(table, row: int, col: int, value: str) -> None:
    table.cell(row, col).text = value


def enable_field_updates(document: Document) -> None:
    settings = document.settings._element
    update_fields = settings.find(qn("w:updateFields"))
    if update_fields is None:
        update_fields = OxmlElement("w:updateFields")
        settings.append(update_fields)
    update_fields.set(qn("w:val"), "true")


def main() -> None:
    if not DOC_PATH.exists():
        raise FileNotFoundError(DOC_PATH)

    if not BACKUP_PATH.exists():
        shutil.copy2(DOC_PATH, BACKUP_PATH)

    document = Document(DOC_PATH)

    # Nội dung tổng quan và ranh giới hệ thống.
    set_paragraph(
        document,
        "Tài liệu mô tả kiến trúc tổng thể",
        "Tài liệu mô tả kiến trúc hiện trạng của GATS Academy theo mô hình 5 cấp, "
        "từ kênh truy cập đến dữ liệu và hạ tầng vận hành. Web học tập, Mobile học viên "
        "và Admin Dashboard dùng chung Backend Express làm nguồn nghiệp vụ; Viava AI "
        "đảm nhiệm năng lực AI chuyên biệt và các nhà cung cấp bên ngoài nằm ngoài ranh giới hệ thống.",
    )
    set_paragraph(
        document,
        "Phạm vi bao gồm Website học viên",
        "Phạm vi bao gồm Web học tập gats.vn, Mobile Flutter chỉ dành cho học viên, "
        "Admin Dashboard admin.gats.vn dùng chung cho quản trị viên và giảng viên theo phân quyền, "
        "Backend Express, Viava AI, Worker xử lý video, PostgreSQL, Redis/BullMQ, MinIO, "
        "video object storage tương thích S3 và các tích hợp Google, SePay, FCM/SMTP, Azure, Tavily, Qdrant.",
    )
    set_paragraph(
        document,
        "Một nguồn nghiệp vụ:",
        "Một nguồn nghiệp vụ: Web, Mobile và Admin Dashboard sử dụng chung Backend Express; "
        "các miền người dùng, học tập, thương mại, nội dung và thông báo là module trong cùng Backend, không phải microservice độc lập.",
    )
    set_paragraph(
        document,
        "Bảo mật theo ranh giới:",
        "Bảo mật theo ranh giới: production chỉ công khai Nginx qua HTTPS; Nginx định tuyến domain/path, "
        "còn Backend chịu trách nhiệm xác thực và phân quyền. Dịch vụ dữ liệu nằm trong mạng Docker nội bộ hoặc dùng endpoint S3 bảo mật.",
    )
    set_paragraph(
        document,
        "Hình 2.1 thể hiện",
        "Hình 2.1 thể hiện năm cấp kiến trúc, ba tác nhân chính và ranh giới GATS Academy. "
        "Học viên truy cập gats.vn hoặc Mobile; quản trị viên và giảng viên cùng truy cập admin.gats.vn, "
        "trong đó admin có toàn quyền còn giảng viên chỉ làm việc trong khu vực /course.",
    )
    set_paragraph(
        document,
        "Cấp 1 là điểm tương tác",
        "Cấp 1 là điểm tương tác trực tiếp. Học viên sử dụng Web gats.vn hoặc Mobile Flutter. "
        "Quản trị viên và giảng viên sử dụng chung Admin Dashboard admin.gats.vn; admin có toàn quyền, "
        "còn role instructor được giới hạn vào các màn hình quản lý khóa học dưới /course. "
        "Không kênh nào truy cập trực tiếp cơ sở dữ liệu.",
    )
    set_paragraph(
        document,
        "Cấp 2 là ranh giới",
        "Cấp 2 là ranh giới công khai giữa Internet và hệ thống. Nginx tiếp nhận cổng 80/443, kết thúc TLS "
        "và reverse proxy theo domain/path đến Web, Admin, Backend API hoặc route Viava được cấu hình. "
        "Xác thực và phân quyền nghiệp vụ được thực thi tại Backend, không phải tại Nginx.",
    )
    set_paragraph(
        document,
        "Cấp 3 tập trung",
        "Cấp 3 thực thi nghiệp vụ lõi. Backend Express :3000 chứa API Core và các module người dùng/xác thực, "
        "khóa học/học tập, thương mại, nội dung/media và thông báo. Viava FastAPI :8000 là ứng dụng AI chuyên biệt; "
        "Backend gọi Viava cho AI Coach, quiz, flashcard và các tác vụ sinh nội dung.",
    )
    set_paragraph(
        document,
        "Cấp 4 xử lý",
        "Cấp 4 xử lý bất đồng bộ bằng Redis/BullMQ và Video Worker FFmpeg/HLS. "
        "Google OAuth, SePay, FCM/SMTP, Azure OpenAI, Tavily và Qdrant là dịch vụ bên ngoài, "
        "được Backend hoặc Viava gọi qua kết nối có kiểm soát; chúng không phải module nội bộ của Cấp 4.",
    )
    set_paragraph(
        document,
        "Cấp 5 lưu trữ",
        "Cấp 5 lưu trạng thái bền vững và cung cấp môi trường vận hành: PostgreSQL cho dữ liệu nghiệp vụ, "
        "MinIO cho ảnh/tài liệu, object storage tương thích S3 cho video gốc và HLS. Production chạy trên VPS bằng Docker Compose; "
        "container app dùng PM2 cho Web, Admin, Backend, Worker và Viava, bên cạnh các container nginx, db, redis và minio.",
    )
    set_paragraph(
        document,
        "Môi trường local có thể",
        "Môi trường local có thể mở thêm cổng phục vụ phát triển. Production chỉ công khai Nginx 80/443. "
        "Docker Compose điều phối container app, nginx, PostgreSQL, Redis và MinIO; PM2 quản lý các tiến trình Web, Admin, Backend, Worker và Viava trong container app.",
    )
    set_paragraph(
        document,
        "Kiến trúc GATS Academy được tổ chức",
        "Kiến trúc GATS Academy được tổ chức thành 5 cấp: kênh truy cập; cổng truy cập; nghiệp vụ lõi; xử lý nền; dữ liệu và hạ tầng. "
        "Học viên dùng Web/Mobile, còn quản trị viên và giảng viên dùng chung admin.gats.vn theo quyền. "
        "Backend Express là nguồn nghiệp vụ thống nhất, Viava cung cấp AI chuyên biệt, Redis/BullMQ và Worker xử lý tác vụ nền, "
        "còn PostgreSQL/MinIO/S3-compatible đảm nhiệm lưu trữ. Mô hình phản ánh đúng cấu hình production Docker Compose hiện tại và vẫn chỉ ra các ưu tiên tiếp theo về thanh toán, quan sát và phục hồi.",
    )

    # Thông tin tài liệu và lịch sử phiên bản.
    info = document.tables[0]
    set_cell(info, 2, 1, "1.1")
    set_cell(info, 4, 1, "Web học viên, Mobile học viên, Admin dùng chung cho admin/instructor, Backend, Viava AI và hạ tầng production")

    history = document.tables[1]
    if not any(row.cells[0].text.strip() == "1.1" for row in history.rows):
        version_row = history.add_row().cells
        version_row[0].text = "1.1"
        version_row[1].text = "04/08/2026"
        version_row[2].text = "Đồng bộ nội dung với sơ đồ 5 cấp mới; hiệu chỉnh vai trò, Backend, Viava, xử lý nền và topology triển khai"
        version_row[3].text = "GATS Academy"

    levels = document.tables[2]
    set_cell(levels, 1, 2, "Web học tập, Mobile học viên và Admin Dashboard; admin và instructor dùng chung admin.gats.vn nhưng khác phạm vi quyền.")
    set_cell(levels, 2, 2, "DNS, Nginx, TLS và reverse proxy theo domain/path; là ranh giới công khai của production. Xác thực/phân quyền nằm tại Backend.")
    set_cell(levels, 3, 2, "Backend Express nguyên khối với các module nghiệp vụ dùng chung; Viava FastAPI cung cấp năng lực AI chuyên biệt.")
    set_cell(levels, 4, 2, "Redis/BullMQ và Video Worker FFmpeg/HLS. Các nhà cung cấp Google, SePay, FCM/SMTP, Azure/Tavily/Qdrant nằm ngoài hệ thống.")
    set_cell(levels, 5, 2, "PostgreSQL, MinIO, video object storage S3-compatible, Docker Compose, PM2 và VPS production.")

    channels = document.tables[3]
    set_cell(channels, 3, 1, "Ứng dụng dùng chung tại admin.gats.vn. Admin có toàn quyền quản trị; instructor chỉ truy cập khu vực /course để quản lý nội dung được phân công.")
    set_cell(channels, 4, 1, "Học viên sử dụng Web/Mobile; quản trị viên và giảng viên cùng sử dụng admin.gats.vn với quyền tương ứng.")

    gateway = document.tables[4]
    set_cell(gateway, 3, 1, "Email/mật khẩu hoặc Google ID token. Backend xác minh danh tính trước khi cấp phiên/token; Nginx chỉ làm cổng TLS và định tuyến.")

    domains = document.tables[5]
    set_cell(domains, 7, 0, "AI Coach session")
    set_cell(domains, 7, 1, "Mobile gọi /api/ai-coach/chat tại Backend; Backend quản lý session, gọi Viava POST /course/chat và không để lộ endpoint/secret AI cho client.")

    integration = document.tables[6]
    set_cell(integration, 1, 1, "Cache và hàng đợi cho tác vụ nền; hiện phục vụ video transcode và quiz AI. Redis không được mở trực tiếp ra Internet.")
    set_cell(integration, 3, 1, "Ứng dụng AI chuyên biệt thuộc tầng nghiệp vụ, cung cấp sinh khóa học, quiz, flashcard và phản hồi AI Coach; Backend gọi qua VIAVA_COURSE_GEN_URL.")
    set_cell(integration, 7, 1, "Các dịch vụ AI, tìm kiếm và vector store bên ngoài được Viava/Backend sử dụng theo cấu hình môi trường.")

    data = document.tables[7]
    set_cell(data, 3, 0, "Video object storage S3-compatible")
    set_cell(data, 3, 1, "Lưu video gốc và đầu ra HLS; production có thể dùng Long Vân S3, local có thể dùng MinIO theo cấu hình môi trường.")
    set_cell(data, 5, 1, "Trong container app, PM2 quản lý Backend, Web, Admin, Video Worker và Viava theo ecosystem.config.js.")

    flows = document.tables[8]
    set_cell(flows, 5, 1, "Mobile gọi Backend /api/ai-coach/chat; Backend xác thực người dùng, quản lý session và gọi Viava POST /course/chat. Kết quả được trả về Mobile mà không lộ endpoint/secret AI.")

    risks = document.tables[10]
    set_cell(risks, 6, 1, "Phụ thuộc độ sẵn sàng/chất lượng của Viava và các nhà cung cấp AI bên ngoài.")

    # Trang sơ đồ: ảnh dọc được đặt trên A3 dọc, giữ đúng tỷ lệ thay vì kéo giãn ngang.
    if len(document.sections) >= 2 and document.inline_shapes:
        diagram_section = document.sections[1]
        diagram_section.orientation = WD_ORIENT.PORTRAIT
        diagram_section.page_width = Inches(11.69)
        diagram_section.page_height = Inches(16.54)
        diagram_section.left_margin = Inches(0.6)
        diagram_section.right_margin = Inches(0.6)
        diagram_section.top_margin = Inches(0.55)
        diagram_section.bottom_margin = Inches(0.55)

        diagram = document.inline_shapes[0]
        source_ratio = 3504 / 2214
        diagram.width = Inches(8.35)
        diagram.height = int(diagram.width * source_ratio)

    enable_field_updates(document)
    document.core_properties.version = "1.1"
    document.core_properties.modified = datetime.now()

    temp_path = DOC_PATH.with_suffix(".tmp.docx")
    document.save(temp_path)
    temp_path.replace(DOC_PATH)
    print(f"Updated: {DOC_PATH}")
    print(f"Backup:  {BACKUP_PATH}")


if __name__ == "__main__":
    main()
