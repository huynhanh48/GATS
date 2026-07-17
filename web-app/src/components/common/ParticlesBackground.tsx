"use client";

import { useEffect, useRef, useState } from "react";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

const DARK_COLORS = ["#ffffff", "#93c5fd", "#c084fc", "#a7f3d0"];
const LIGHT_COLORS = ["#0070eb", "#d946ef", "#10b981", "#f59e0b"];

let pluginsInitialized = false;

function buildOptions(isDark: boolean) {
  return {
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      color: {
        value: isDark ? DARK_COLORS : LIGHT_COLORS,
      },
      links: { enable: false },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: { default: "out" as const },
        random: true,
        speed: 0.8,
        straight: false,
      },
      number: {
        density: { enable: true, width: 1920, height: 1080 },
        value: 70,
      },
      opacity: {
        value: isDark ? { min: 0.1, max: 0.4 } : { min: 0.5, max: 0.9 },
        animation: { enable: true, speed: 0.8, sync: false },
      },
      size: {
        value: isDark ? { min: 1, max: 3 } : { min: 2, max: 5 },
      },
    },
    detectRetina: true,
  };
}

export function ParticlesBackground({ id = "tsparticles-container" }: { id?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Wait until resolvedTheme is determined (not undefined)
    if (!resolvedTheme) return;

    const isDark = resolvedTheme === "dark";

    const initParticles = async () => {
      if (!pluginsInitialized) {
        await loadSlim(tsParticles);
        pluginsInitialized = true;
      }

      // Always destroy before reinit so color changes take effect
      if (containerRef.current) {
        await containerRef.current.destroy();
        containerRef.current = null;
      }

      // Remove any old DOM canvas tsParticles may have left behind
      const old = document.getElementById(id);
      if (old) {
        const canvas = old.querySelector("canvas");
        if (canvas) canvas.remove();
      }

      containerRef.current = await tsParticles.load({
        id,
        options: buildOptions(isDark),
      });
    };

    initParticles();

    return () => {
      if (containerRef.current) {
        containerRef.current.destroy();
        containerRef.current = null;
      }
    };
  }, [resolvedTheme, mounted, id]);

  return (
    <div
      id={id}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
