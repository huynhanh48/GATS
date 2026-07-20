"use client"

/**
 * TipTap demo used to own a separate ThemeToggle that wrote
 * `document.documentElement.classList` from `prefers-color-scheme`.
 * That overwrote next-themes whenever the lesson/post editor mounted.
 *
 * Theme is controlled only by the header toggle + ThemeProvider now.
 * This module is kept as a thin next-themes wrapper in case a toolbar
 * needs a local control later — it must never set the class itself.
 */
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"
import { SunIcon } from "@/components/tiptap-icons/sun-icon"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDarkMode = resolvedTheme === "dark"

  return (
    <Button
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      variant="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}
