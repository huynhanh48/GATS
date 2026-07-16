import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "./icons";

const THEMES = [
  {
    name: "light",
    Icon: Sun,
  },
  {
    name: "dark",
    Icon: Moon,
  },
];

export function ThemeToggleSwitch() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="group cursor-pointer rounded-full border border-slate-200 bg-slate-100 p-1 text-slate-700 outline-0 transition hover:border-[#0070EB]/40 focus-visible:outline focus-visible:outline-[#0070EB] dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-300"
    >
      <span className="sr-only">
        Switch to {theme === "light" ? "dark" : "light"} mode
      </span>

      <span aria-hidden className="relative flex gap-2.5">
        {/* Indicator */}
        <span className="absolute size-9.5 rounded-full border border-slate-200 bg-white shadow-sm transition-all dark:translate-x-12 dark:border-slate-600 dark:bg-slate-700" />

        {THEMES.map(({ name, Icon }) => (
          <span
            key={name}
            className={cn(
              "relative grid size-9.5 place-items-center rounded-full",
              name === "dark" && "dark:text-white",
            )}
          >
            <Icon />
          </span>
        ))}
      </span>
    </button>
  );
}
