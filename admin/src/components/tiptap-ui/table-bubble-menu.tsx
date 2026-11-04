import { type Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  MinusSquare,
  PanelTop,
  TableCellsMerge,
  TableCellsSplit,
  Trash,
} from "lucide-react"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { cn } from "@/lib/utils"

const cellColors = [
  { label: "Không màu", value: null, className: "bg-white" },
  { label: "Vàng nhạt", value: "#fef3c7", className: "bg-amber-100" },
  { label: "Xanh nhạt", value: "#dbeafe", className: "bg-blue-100" },
  { label: "Xanh lá nhạt", value: "#dcfce7", className: "bg-green-100" },
  { label: "Xám nhạt", value: "#e2e8f0", className: "bg-slate-200" },
] as const

function MenuButton({
  active = false,
  ...props
}: React.ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-8 w-8 shrink-0 p-0 text-slate-600 hover:bg-slate-100",
        active && "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
      )}
      {...props}
    />
  )
}

const Divider = () => <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

export function TableBubbleMenu({ editor: providedEditor }: { editor?: Editor | null }) {
  const { editor } = useTiptapEditor(providedEditor)

  if (!editor) return null

  const setTextAlign = (alignment: "left" | "center" | "right") =>
    editor.chain().focus().setTextAlign(alignment).run()

  const setVerticalAlign = (alignment: "top" | "middle" | "bottom") =>
    editor.chain().focus().setCellAttribute("verticalAlign", alignment).run()

  return (
    <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive("table")}>
      <div
        className="flex max-w-[min(92vw,760px)] items-center gap-0.5 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
        role="toolbar"
        aria-label="Công cụ chỉnh sửa bảng"
      >
        <MenuButton tooltip="Căn nội dung sang trái" aria-label="Căn trái" active={editor.isActive({ textAlign: "left" })} onClick={() => setTextAlign("left")}>
          <AlignLeft className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Căn giữa nội dung" aria-label="Căn giữa" active={editor.isActive({ textAlign: "center" })} onClick={() => setTextAlign("center")}>
          <AlignCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Căn nội dung sang phải" aria-label="Căn phải" active={editor.isActive({ textAlign: "right" })} onClick={() => setTextAlign("right")}>
          <AlignRight className="h-4 w-4" />
        </MenuButton>

        <Divider />

        <MenuButton tooltip="Căn nội dung lên trên" aria-label="Căn trên" onClick={() => setVerticalAlign("top")}>
          <AlignVerticalJustifyStart className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Căn nội dung vào giữa ô" aria-label="Căn giữa theo chiều dọc" onClick={() => setVerticalAlign("middle")}>
          <AlignVerticalJustifyCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Căn nội dung xuống dưới" aria-label="Căn dưới" onClick={() => setVerticalAlign("bottom")}>
          <AlignVerticalJustifyEnd className="h-4 w-4" />
        </MenuButton>

        <Divider />

        <MenuButton tooltip="Bật hoặc tắt hàng tiêu đề" aria-label="Hàng tiêu đề" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
          <PanelTop className="h-4 w-4" />
        </MenuButton>
        <div className="flex shrink-0 items-center gap-1 px-1" aria-label="Màu nền ô">
          {cellColors.map((color) => (
            <button
              key={color.label}
              type="button"
              title={color.label}
              aria-label={`Màu nền: ${color.label}`}
              className={cn("h-5 w-5 rounded border border-slate-300 shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-blue-500", color.className)}
              onClick={() => editor.chain().focus().setCellAttribute("backgroundColor", color.value).run()}
            />
          ))}
        </div>

        <Divider />

        <MenuButton tooltip="Thêm hàng phía trên" aria-label="Thêm hàng trên" onClick={() => editor.chain().focus().addRowBefore().run()}>
          <ArrowUpToLine className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Thêm hàng phía dưới" aria-label="Thêm hàng dưới" onClick={() => editor.chain().focus().addRowAfter().run()}>
          <ArrowDownToLine className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Xóa hàng" aria-label="Xóa hàng" disabled={!editor.can().deleteRow()} onClick={() => editor.chain().focus().deleteRow().run()}>
          <MinusSquare className="h-4 w-4" />
        </MenuButton>

        <Divider />

        <MenuButton tooltip="Thêm cột bên trái" aria-label="Thêm cột trái" onClick={() => editor.chain().focus().addColumnBefore().run()}>
          <ArrowLeftToLine className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Thêm cột bên phải" aria-label="Thêm cột phải" onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <ArrowRightToLine className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Xóa cột" aria-label="Xóa cột" disabled={!editor.can().deleteColumn()} onClick={() => editor.chain().focus().deleteColumn().run()}>
          <MinusSquare className="h-4 w-4 rotate-90" />
        </MenuButton>

        <Divider />

        <MenuButton tooltip="Gộp các ô đã chọn" aria-label="Gộp ô" disabled={!editor.can().mergeCells()} onClick={() => editor.chain().focus().mergeCells().run()}>
          <TableCellsMerge className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Tách ô" aria-label="Tách ô" disabled={!editor.can().splitCell()} onClick={() => editor.chain().focus().splitCell().run()}>
          <TableCellsSplit className="h-4 w-4" />
        </MenuButton>
        <MenuButton tooltip="Xóa toàn bộ bảng" aria-label="Xóa bảng" className="h-8 w-8 shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => editor.chain().focus().deleteTable().run()}>
          <Trash className="h-4 w-4" />
        </MenuButton>
      </div>
    </BubbleMenu>
  )
}
