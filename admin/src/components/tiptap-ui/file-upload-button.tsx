import { useRef, useState } from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { PaperclipIcon } from "lucide-react"
import { handleFileUpload } from "@/lib/tiptap-utils"
import { toast } from "sonner"

export const FileUploadButton = () => {
  const { editor } = useTiptapEditor()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    setIsUploading(true)
    const loadingToast = toast.loading(`Đang tải lên ${file.name}...`)

    try {
      const result = await handleFileUpload(file)
      
      // Insert structured content so the file name and URL are escaped safely.
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "text",
            text: result.name,
            marks: [
              {
                type: "link",
                attrs: {
                  href: result.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
            ],
          },
          { type: "text", text: " " },
        ])
        .run()
      
      toast.success("Tải file thành công!", { id: loadingToast })
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Tải file thất bại", {
        id: loadingToast,
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.md,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp"
      />
      <Button
        type="button"
        variant="ghost"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        tooltip="Tải file đính kèm (tối đa 500MB)"
        aria-label="Tải file đính kèm"
      >
        <PaperclipIcon className="tiptap-button-icon" />
      </Button>
    </>
  )
}
