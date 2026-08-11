import json
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / "docs" / "gats-architecture-graph.json"
OUTPUT_PATH = ROOT / "docs" / "gats-architecture-technical-redesign.svg"

W, H = 1800, 2100


def text_block(x, y, title, subtitle="", title_size=20, anchor="middle", color="#102A4C"):
    lines = [f'<text x="{x}" y="{y}" text-anchor="{anchor}" class="node-title" font-size="{title_size}" fill="{color}">{escape(title)}</text>']
    if subtitle:
        parts = [part.strip() for part in subtitle.split("|")]
        for index, part in enumerate(parts):
            lines.append(f'<text x="{x}" y="{y + 30 + index * 24}" text-anchor="{anchor}" class="node-subtitle">{escape(part)}</text>')
    return "\n".join(lines)


def card(node_id, x, y, w, h, title, subtitle="", accent="#2F6FED", fill="#FFFFFF", dashed=False):
    dash = ' stroke-dasharray="8 7"' if dashed else ""
    return f'''
    <g id="node-{node_id}">
      <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{fill}" stroke="{accent}" stroke-width="2"{dash} filter="url(#shadow)"/>
      {text_block(x + w / 2, y + 35, title, subtitle)}
    </g>'''


def group_box(x, y, w, h, title, subtitle=""):
    second = f'<text x="{x + w / 2}" y="{y + 57}" text-anchor="middle" class="group-subtitle">{escape(subtitle)}</text>' if subtitle else ""
    return f'''
    <g>
      <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="#EEF5FF" stroke="#B7CAE3" stroke-width="2"/>
      <text x="{x + w / 2}" y="{y + 34}" text-anchor="middle" class="group-title">{escape(title)}</text>
      {second}
    </g>'''


def path(points, dotted=False, color="#2F6FED"):
    d = "M " + " L ".join(f"{x} {y}" for x, y in points)
    dash = ' stroke-dasharray="7 7"' if dotted else ""
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2.5"{dash} marker-end="url(#arrow)"/>'


def main():
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    nodes = {node["id"]: node for node in graph["nodes"]}

    svg = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#17365D" flood-opacity="0.10"/></filter>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#2F6FED"/></marker>
      <style>
        text {{ font-family: Arial, 'Segoe UI', sans-serif; }}
        .group-title {{ font-size:25px; font-weight:700; fill:#102A4C; }}
        .group-subtitle {{ font-size:18px; font-weight:700; fill:#345A86; }}
        .node-title {{ font-weight:700; }}
        .node-subtitle {{ font-size:15px; fill:#496582; }}
      </style>
    </defs>
    <rect width="1800" height="2100" fill="#F8FBFF"/>
    <text x="900" y="36" text-anchor="middle" font-size="29" font-weight="700" fill="#102A4C">KIẾN TRÚC HỆ THỐNG GATS ACADEMY</text>
    ''']

    # Group containers.
    svg += [
        group_box(120, 185, 1560, 245, "KÊNH TRUY CẬP"),
        group_box(590, 475, 620, 175, "CỔNG TRUY CẬP"),
        group_box(70, 700, 1660, 500, "NGHIỆP VỤ LÕI", "BACKEND EXPRESS :3000"),
        group_box(90, 1280, 790, 245, "DỊCH VỤ BÊN NGOÀI"),
        group_box(920, 1280, 790, 245, "XỬ LÝ NỀN"),
        group_box(210, 1605, 1380, 245, "DỮ LIỆU"),
    ]

    # Actor row.
    actor_positions = {
        "admin_actor": (180, 65), "instructor_actor": (750, 65), "learner_actor": (1320, 65)
    }
    for node_id, (x, y) in actor_positions.items():
        node = nodes[node_id]
        svg.append(card(node_id, x, y, 300, 90, node["label"], node.get("subtitle", "")))

    # Access row.
    access_positions = {
        "admin_dashboard": (180, 270, 390), "web": (705, 270, 390), "mobile": (1230, 270, 390)
    }
    for node_id, (x, y, w) in access_positions.items():
        node = nodes[node_id]
        svg.append(card(node_id, x, y, w, 115, node["label"], node.get("subtitle", "")))

    # Gateway and API.
    node = nodes["nginx"]
    svg.append(card("nginx", 700, 535, 400, 88, node["label"], node["subtitle"], accent="#FF7622", fill="#FFF7ED"))
    node = nodes["api"]
    svg.append(card("api", 650, 785, 500, 90, node["label"], node["subtitle"], accent="#2F6FED"))

    # Six modules on one row, Viana is visually peer-aligned but differentiated.
    module_ids = ["notification", "auth", "commerce", "learning", "content", "viana"]
    module_x = [95, 370, 645, 920, 1195, 1470]
    for node_id, x in zip(module_ids, module_x):
        node = nodes[node_id]
        accent = "#7C3AED" if node_id == "viana" else "#7692B5"
        fill = "#F7F3FF" if node_id == "viana" else "#FFFFFF"
        svg.append(card(node_id, x, 950, 235, 150, node["label"], node.get("subtitle", ""), accent=accent, fill=fill))

    # External services.
    ext_ids = ["messaging", "google", "sepay", "ai_providers"]
    ext_x = [115, 305, 495, 685]
    for node_id, x in zip(ext_ids, ext_x):
        node = nodes[node_id]
        svg.append(card(node_id, x, 1370, 165, 95, node["label"], node.get("subtitle", ""), accent="#91A8C5"))

    # Background processing.
    for node_id, x in [("redis", 1010), ("video_worker", 1360)]:
        node = nodes[node_id]
        svg.append(card(node_id, x, 1360, 260, 110, node["label"], node.get("subtitle", ""), accent="#0F9F8F"))

    # Data only: no Redis and no Docker node here.
    for node_id, x in [("video_storage", 275), ("minio", 725), ("postgres", 1175)]:
        node = nodes[node_id]
        svg.append(card(node_id, x, 1690, 350, 105, node["label"], node.get("subtitle", ""), accent="#2F6FED"))

    # Deployment is an annotation/boundary, not a business/data node.
    deployment = graph["renderingConstraints"]["deployment"]
    deployment_text = f'{deployment["label"]} — {deployment["note"]}'
    svg.append(f'''<g><rect x="330" y="1930" width="1140" height="105" rx="20" fill="#F4F0FF" stroke="#7C3AED" stroke-width="2" stroke-dasharray="10 8"/>
      <text x="900" y="1972" text-anchor="middle" font-size="23" font-weight="700" fill="#4C1D95">RANH GIỚI TRIỂN KHAI</text>
      <text x="900" y="2007" text-anchor="middle" font-size="18" fill="#553C7B">{escape(deployment_text)}</text></g>''')

    # Edges: actors and access.
    svg += [
        path([(330,155),(330,270)]), path([(900,155),(900,215),(375,215),(375,270)]),
        path([(1470,155),(1470,235),(900,235),(900,270)]), path([(1470,155),(1470,270)]),
        path([(375,385),(375,450),(820,450),(820,535)]),
        path([(900,385),(900,535)]), path([(1425,385),(1425,450),(980,450),(980,535)]),
        path([(900,623),(900,785)]),
        # Nginx direct to Viana, routed on the far right of the core panel.
        path([(1100,579),(1675,579),(1675,930),(1588,930),(1588,950)]),
    ]

    # API bus to all six modules.
    for x in [212, 487, 762, 1037, 1312, 1587]:
        svg.append(path([(900,875),(900,920),(x,920),(x,950)]))

    # Dotted integrations.
    svg += [
        path([(212,1100),(212,1370)], dotted=True),
        path([(760,875),(760,1235),(387,1235),(387,1370)], dotted=True),
        path([(762,1100),(762,1260),(577,1260),(577,1370)], dotted=True),
        path([(1587,1100),(1587,1245),(767,1245),(767,1370)], dotted=True),
    ]

    # Processing and storage flows.
    svg += [
        path([(900,875),(900,1215),(1140,1215),(1140,1360)]),
        path([(1312,1100),(1312,1250),(1140,1250),(1140,1360)]),
        path([(1270,1415),(1360,1415)]),
        path([(1490,1470),(1490,1570),(450,1570),(450,1690)]),
        path([(1312,1100),(1312,1550),(900,1550),(900,1690)]),
        path([(1312,1100),(1312,1535),(450,1535),(450,1690)]),
        path([(650,875),(650,1590),(1350,1590),(1350,1690)]),
    ]

    # Legend.
    svg.append('''<g transform="translate(650 1875)"><line x1="0" y1="0" x2="65" y2="0" stroke="#2F6FED" stroke-width="3"/><text x="80" y="6" font-size="16" fill="#496582">Luồng nội bộ</text><line x1="250" y1="0" x2="315" y2="0" stroke="#2F6FED" stroke-width="3" stroke-dasharray="7 7"/><text x="330" y="6" font-size="16" fill="#496582">Tích hợp bên ngoài</text></g>''')
    svg.append("</svg>")
    OUTPUT_PATH.write_text("\n".join(svg), encoding="utf-8")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
