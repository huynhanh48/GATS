"use client"

import { useCallback, useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Lib ---
import { isExtensionAvailable } from "@/lib/tiptap-utils"

// --- Icons ---
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

export const TEXT_COLORS = [
  {
    label: "Default text",
    value: "",
    colorValue: "inherit",
  },
  {
    label: "Gray",
    value: "#6b7280",
    colorValue: "#6b7280",
  },
  {
    label: "Brown",
    value: "#78350f",
    colorValue: "#78350f",
  },
  {
    label: "Orange",
    value: "#ea580c",
    colorValue: "#ea580c",
  },
  {
    label: "Yellow",
    value: "#eab308",
    colorValue: "#eab308",
  },
  {
    label: "Green",
    value: "#16a34a",
    colorValue: "#16a34a",
  },
  {
    label: "Blue",
    value: "#2563eb",
    colorValue: "#2563eb",
  },
  {
    label: "Purple",
    value: "#9333ea",
    colorValue: "#9333ea",
  },
  {
    label: "Pink",
    value: "#db2777",
    colorValue: "#db2777",
  },
  {
    label: "Red",
    value: "#dc2626",
    colorValue: "#dc2626",
  },
]
export type TextColor = (typeof TEXT_COLORS)[number]

export interface UseTextColorConfig {
  editor?: Editor | null
  textColor?: string
  label?: string
  hideWhenUnavailable?: boolean
  onApplied?: ({ color, label }: { color: string; label: string }) => void
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(TEXT_COLORS.map((color) => [color.value, color]))
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof TEXT_COLORS)[number] => !!color)
}

export function canTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, ["textStyle"])) return false
  return editor.can().setColor("test")
}

export function isTextColorActive(editor: Editor | null, color?: string): boolean {
  if (!editor || !editor.isEditable) return false
  return color ? editor.isActive("textStyle", { color }) : false
}

export function removeTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canTextColor(editor)) return false
  return editor.chain().focus().unsetColor().run()
}

export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor) return false

  if (!hideWhenUnavailable) {
    return true
  }

  if (!editor.isEditable) return false
  if (!isExtensionAvailable(editor, ["textStyle"])) return false
  if (!editor.isActive("code")) {
    return canTextColor(editor)
  }

  return true
}

export function useTextColor(config: UseTextColorConfig) {
  const {
    editor: providedEditor,
    label,
    textColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const [activeColor, setActiveColor] = useState<string | undefined>(undefined)
  const canTextColorState = canTextColor(editor)
  const actualColor = textColor
  const isActive = isTextColorActive(editor, actualColor)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
      // Get the current active color from the editor selection
      const attrs = editor.getAttributes("textStyle")
      setActiveColor(attrs?.color ?? undefined)
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)
    editor.on("transaction", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
      editor.off("transaction", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleTextColor = useCallback(() => {
    if (!editor || !canTextColorState || !actualColor || !label) return false

    const success = editor.chain().focus().setColor(actualColor).run()
    if (success) {
      onApplied?.({ color: actualColor, label })
    }
    return success
  }, [canTextColorState, actualColor, editor, label, onApplied])

  const handleRemoveTextColor = useCallback(() => {
    const success = removeTextColor(editor)
    if (success) {
      onApplied?.({ color: "", label: "Remove color" })
    }
    return success
  }, [editor, onApplied])

  return {
    isVisible,
    isActive,
    handleTextColor,
    handleRemoveTextColor,
    canTextColor: canTextColorState,
    activeColor,
    label: label || `Text Color`,
    Icon: TextColorIcon,
  }
}
