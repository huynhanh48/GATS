"use client"

import { forwardRef, useCallback, useState } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { Table as TableIcon } from "lucide-react"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"

export interface TablePopoverProps extends Omit<ButtonProps, "type"> {
  onOpenChange?: (isOpen: boolean) => void
}

export const TablePopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        type="button"
        className={className}
        variant="ghost"
        role="button"
        tabIndex={-1}
        aria-label="Table"
        tooltip="Chèn bảng"
        ref={ref}
        {...props}
      >
        {children || <TableIcon className="tiptap-button-icon" />}
      </Button>
    )
  }
)

TablePopoverButton.displayName = "TablePopoverButton"

export const TablePopover = forwardRef<HTMLButtonElement, TablePopoverProps>(
  ({ onOpenChange, onClick, children, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor()
    const [isOpen, setIsOpen] = useState(false)
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

    const MAX_ROWS = 8
    const MAX_COLS = 10

    const handleOnOpenChange = useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen)
        if (!nextIsOpen) {
          setHoveredCell(null)
        }
        onOpenChange?.(nextIsOpen)
      },
      [onOpenChange]
    )

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        setIsOpen(!isOpen)
      },
      [onClick, isOpen]
    )

    const insertTable = (rows: number, cols: number) => {
      if (!editor) return
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run()
      setIsOpen(false)
      setHoveredCell(null)
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <TablePopoverButton
            aria-label="Chèn bảng"
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <TableIcon className="tiptap-button-icon" />}
          </TablePopoverButton>
        </PopoverTrigger>

        <PopoverContent
          collisionPadding={4}
          className="w-auto p-3"
          sideOffset={8}
        >
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-500">
              {hoveredCell ? `${hoveredCell.row} x ${hoveredCell.col} Bảng` : "Chèn bảng"}
            </div>
            <div 
              className="grid gap-[2px]" 
              style={{ gridTemplateColumns: `repeat(${MAX_COLS}, minmax(0, 1fr))` }}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {Array.from({ length: MAX_ROWS }).map((_, rIndex) => {
                const row = rIndex + 1
                return Array.from({ length: MAX_COLS }).map((_, cIndex) => {
                  const col = cIndex + 1
                  const isHighlighted = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col

                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`h-4 w-4 rounded-sm border cursor-pointer ${
                        isHighlighted
                          ? "bg-blue-500 border-blue-600"
                          : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      }`}
                      onMouseEnter={() => setHoveredCell({ row, col })}
                      onClick={() => insertTable(row, col)}
                    />
                  )
                })
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)

TablePopover.displayName = "TablePopover"
export default TablePopover
