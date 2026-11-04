import { Table } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"

const tableCellAttributes = {
  verticalAlign: {
    default: "top",
    parseHTML: (element: HTMLElement) => element.style.verticalAlign || "top",
    renderHTML: (attributes: Record<string, unknown>) => ({
      style: `vertical-align: ${attributes.verticalAlign || "top"}`,
    }),
  },
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? { style: `background-color: ${attributes.backgroundColor}` }
        : {},
  },
}

export const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "left",
        parseHTML: (element) => element.getAttribute("align") || "left",
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === "left") {
            return {
              "data-align": "left",
              style: "margin-left: 0; margin-right: auto;",
            }
          }
          if (attributes.align === "center") {
            return {
              "data-align": "center",
              style: "margin-left: auto; margin-right: auto;",
            }
          }
          if (attributes.align === "right") {
            return {
              "data-align": "right",
              style: "margin-left: auto; margin-right: 0;",
            }
          }
          return {}
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            "data-width": attributes.width,
            style: `width: ${attributes.width}`,
          }
        },
      },
    }
  },
})

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...tableCellAttributes,
    }
  },
})

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...tableCellAttributes,
    }
  },
})
