"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const KEY = "dug-theme";

function applyTheme(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  // Briefly enable transitions only for the toggle — not for navigation.
  const html = document.documentElement;
  html.classList.add("theme-switching");
  html.setAttribute("data-theme", resolved);
  window.setTimeout(() => html.classList.remove("theme-switching"), 200);
}

export function ThemeToggle({ className }: { className?: string }) {
  // Render-safe placeholder until mounted to avoid hydration mismatch.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme) ?? "system";
    setTheme(saved);

    // React to system changes when in "system" mode
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const cur = (localStorage.getItem(KEY) as Theme) ?? "system";
      if (cur === "system") applyTheme("system");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  function pick(next: Theme) {
    setTheme(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  if (!theme) {
    // Reserve layout space; invisible until mounted.
    return <div className={cn("h-9 w-24", className)} aria-hidden />;
  }

  const opts: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border bg-[var(--color-card)] p-0.5",
        className,
      )}
    >
      {opts.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            onClick={() => pick(value)}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
              active
                ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-fg)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
