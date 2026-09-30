import React from 'react';
import { BookOpen, Library, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  title: string;
  onToggleTheme: () => void;
  onOpenLibrary: () => void;
  onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  title,
  onToggleTheme,
  onOpenLibrary,
  onBack,
}) => {
  return (
    <header className="workspace-header">
      <div className="workspace-header-left">
        <button
          type="button"
          tabIndex={-1}
          className="pixel-button header-brand"
          onClick={onBack}
          aria-label="Back to home"
        >
          <BookOpen size={16} />
          <span>NOTEBOOK</span>
        </button>
      </div>

      <div className="workspace-header-title">
        {title}
      </div>

      <div className="workspace-header-actions">
        <button
          type="button"
          tabIndex={-1}
          className="pixel-button header-action"
          onClick={onOpenLibrary}
          aria-label="Open library"
        >
          <Library size={15} />
          <span>L</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          className="pixel-button header-action"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Sun size={15} />
          ) : (
            <Moon size={15} />
          )}

          <span>T</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          className="pixel-button header-back"
          onClick={onBack}
        >
          ESC
        </button>
      </div>
    </header>
  );
};