import { useEffect, useState } from "react";

export default function MKRCThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("mkrc-theme") as "dark" | "light" | null;
    const initial = stored || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-mkrc-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("mkrc-theme", next);
    document.documentElement.setAttribute("data-mkrc-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      className="mkrc-label flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        width: 40,
        height: 40,
        border: "1px solid var(--mkrc-border-medium)",
        color: "var(--mkrc-text-secondary)",
        backgroundColor: "transparent",
        fontSize: "1.1rem",
        cursor: "pointer",
      }}
    >
      {theme === "dark" ? "☽" : "☀"}
    </button>
  );
}
