"use client"

import { forwardRef, useMemo, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"

// --- Tiptap UI ---
import type {
  TextColor,
  UseTextColorConfig,
} from "@/components/tiptap-ui/text-color-button"
import {
  TextColorButton,
  pickTextColorsByValue,
  useTextColor,
  TEXT_COLORS,
} from "@/components/tiptap-ui/text-color-button"
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group"

export interface TextColorPopoverContentProps {
  editor?: Editor | null
  colors?: TextColor[]
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">, Pick<UseTextColorConfig, "editor" | "hideWhenUnavailable" | "onApplied"> {
  colors?: TextColor[]
}

export const TextColorPopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      type="button"
      className={className}
      variant="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Text color"
      tooltip="Text color"
      ref={ref}
      {...props}
    >
      {children ?? <TextColorIcon className="tiptap-button-icon" />}
    </Button>
  )
)

TextColorPopoverButton.displayName = "TextColorPopoverButton"

export function TextColorPopoverContent({
  editor,
  colors = TEXT_COLORS,
}: TextColorPopoverContentProps) {
  const { handleRemoveTextColor } = useTextColor({ editor })
  const isMobile = useIsBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)

  const menuItems = useMemo(
    () => [...colors, { label: "Remove color", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "none") handleRemoveTextColor()
      return true
    },
    autoSelectFirstItem: false,
  })

  // To fit more colors cleanly on mobile/desktop, we could chunk them.
  // But ButtonGroup supports flex-wrap. We'll rely on the parent CSS.
  // We'll wrap in rows of 5 or let flex wrap do it.
  const row1 = colors.slice(0, 5)
  const row2 = colors.slice(5)

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="vertical">
          <CardItemGroup orientation="horizontal">
            <ButtonGroup>
              {row1.map((color, index) => {
                const itemIndex = index
                return (
                  <ButtonGroup key={color.value}>
                    <TextColorButton
                      editor={editor}
                      textColor={color.value}
                      tooltip={color.label}
                      aria-label={`${color.label} text color`}
                      tabIndex={itemIndex === selectedIndex ? 0 : -1}
                      data-highlighted={selectedIndex === itemIndex}
                    />
                  </ButtonGroup>
                )
              })}
            </ButtonGroup>
          </CardItemGroup>
          {row2.length > 0 && (
            <CardItemGroup orientation="horizontal">
              <ButtonGroup>
                {row2.map((color, index) => {
                  const itemIndex = row1.length + index
                  return (
                    <ButtonGroup key={color.value}>
                      <TextColorButton
                        editor={editor}
                        textColor={color.value}
                        tooltip={color.label}
                        aria-label={`${color.label} text color`}
                        tabIndex={itemIndex === selectedIndex ? 0 : -1}
                        data-highlighted={selectedIndex === itemIndex}
                      />
                    </ButtonGroup>
                  )
                })}
              </ButtonGroup>
            </CardItemGroup>
          )}
          <Separator />
          <ButtonGroup>
            <Button
              onClick={handleRemoveTextColor}
              aria-label="Remove color"
              tooltip="Remove color"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              variant="ghost"
              data-highlighted={selectedIndex === colors.length}
            >
              <BanIcon className="tiptap-button-icon" />
              <span className="text-sm font-medium tiptap-button-text">Remove color</span>
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function TextColorPopover({
  editor: providedEditor,
  colors = TEXT_COLORS,
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: TextColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const { isVisible, canTextColor, isActive, activeColor, label, Icon } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton
          disabled={!canTextColor}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canTextColor}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" activeColor={activeColor ?? "currentColor"} />
        </TextColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text colors">
        <TextColorPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}

export default TextColorPopover
