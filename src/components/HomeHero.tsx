import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Moon,
  Sun,
} from "lucide-react";
import type { ThemeMode } from "../types";

interface HomeHeroProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onStartReading: () => void;
  onOpenNewDoc: () => void;
  onOpenLibrary: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
}

type Target =
  | "theme"
  | "about"
  | "enter"
  | "new"
  | "library"
  | "shortcuts";

const targets: Target[] = [
  "theme",
  "about",
  "enter",
  "new",
  "library",
  "shortcuts",
];

export function HomeHero({
  theme,
  onToggleTheme,
  onStartReading,
  onOpenNewDoc,
  onOpenLibrary,
  onOpenShortcuts,
  onOpenAbout,
}: HomeHeroProps) {
  const [selected, setSelected] = useState(2);

  const activate = useCallback(
    (target: Target) => {
      if (target === "theme") onToggleTheme();
      if (target === "about") onOpenAbout();
      if (target === "enter") onStartReading();
      if (target === "new") onOpenNewDoc();
      if (target === "library") onOpenLibrary();
      if (target === "shortcuts") onOpenShortcuts();
    },
    [
      onToggleTheme,
      onOpenAbout,
      onStartReading,
      onOpenNewDoc,
      onOpenLibrary,
      onOpenShortcuts,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((value) => (value - 1 + targets.length) % targets.length);
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((value) => (value + 1) % targets.length);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        activate(targets[selected]);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(2);
      }

      const key = event.key.toLowerCase();

      if (key === "t") {
        onToggleTheme();
      }

      if (key === "n") {
        onOpenNewDoc();
      }

      if (key === "l") {
        onOpenLibrary();
      }

      if (key === "?") {
        onOpenShortcuts();
      }

      if (key === "a") {
        onOpenAbout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activate,
    selected,
    onToggleTheme,
    onOpenNewDoc,
    onOpenLibrary,
    onOpenShortcuts,
    onOpenAbout,
  ]);

  const buttonClass = (target: Target) =>
    `pixel-button ${
      targets[selected] === target ? "keyboard-focus" : ""
    }`;

  return (
    <main className="home-hero pixel-texture">
      <div className="home-topbar">
        <button
          className={buttonClass("theme")}
          onClick={onToggleTheme}
          tabIndex={-1}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Sun size={15} /> : <Moon size={15} />}
          {theme === "light" ? "DAY" : "NIGHT"}
        </button>

        <button
          className={buttonClass("about")}
          onClick={onOpenAbout}
          tabIndex={-1}
        >
          A · ABOUT
        </button>
      </div>

      <section className="home-center">
        <div className="home-logo">
          <div className="home-logo-block">
            <span>N</span>
          </div>

          <div>
            <h1 className="home-title">NOTEBOOK</h1>
            <p className="home-subtitle">KEYBOARD EDITION</p>
          </div>
        </div>

        <div className="minecraft-divider" />

        <p className="home-tagline">
          READ. THINK. ANNOTATE.
        </p>

        <p className="home-warning">
          MOUSE? NOT REQUIRED.
        </p>

        <button
          className={buttonClass("enter") + " home-enter"}
          onClick={onStartReading}
          tabIndex={-1}
        >
          <span>ENTER WORKSPACE</span>
          <span className="keyboard-key">ENTER</span>
        </button>

        <div className="home-actions">
          <button
            className={buttonClass("new")}
            onClick={onOpenNewDoc}
            tabIndex={-1}
          >
            N · NEW
          </button>

          <button
            className={buttonClass("library")}
            onClick={onOpenLibrary}
            tabIndex={-1}
          >
            L · LIBRARY
          </button>

          <button
            className={buttonClass("shortcuts")}
            onClick={onOpenShortcuts}
            tabIndex={-1}
          >
            ? · SHORTCUTS
          </button>
        </div>
      </section>

      <div className="home-hud">
        <span className="keyboard-key">
          <ArrowUp size={11} />
        </span>
        <span className="keyboard-key">
          <ArrowDown size={11} />
        </span>
        <span className="keyboard-key">
          <ArrowLeft size={11} />
        </span>
        <span className="keyboard-key">
          <ArrowRight size={11} />
        </span>
        <span>NAVIGATE</span>
        <span className="keyboard-key">ENTER</span>
        <span>SELECT</span>
        <span className="keyboard-key">ESC</span>
        <span>BACK</span>
      </div>
    </main>
  );
}