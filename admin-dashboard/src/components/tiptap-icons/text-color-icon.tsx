import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg"> & {
  /** Active color shown in the bottom color bar. Defaults to currentColor. */
  activeColor?: string
}

export const TextColorIcon = memo(({ className, activeColor, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Paint brush handle + bristles */}
      <path
        d="M20.707 5.826a1 1 0 0 0-1.414 0l-9.5 9.5a1 1 0 0 0-.263.464l-.758 3.032a.5.5 0 0 0 .606.606l3.032-.758a1 1 0 0 0 .464-.263l9.5-9.5a1 1 0 0 0 0-1.414l-1.667-1.667Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Brush round tip */}
      <circle cx="5.5" cy="17.5" r="2.5" fill="currentColor" opacity="0.7" />
      {/* Color swatch bar at bottom — reflects active color */}
      <rect
        x="2"
        y="21.25"
        width="20"
        height="2"
        rx="1"
        fill={activeColor ?? "currentColor"}
      />
    </svg>
  )
})

TextColorIcon.displayName = "TextColorIcon"
