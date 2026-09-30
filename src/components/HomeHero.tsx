import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react';
import type { ThemeMode } from '../types';

interface HomeHeroProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onStartReading: () => void;
  onOpenNewDoc: () => void;
  onOpenLibrary: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
}

type FocusTarget = 'theme' | 'about' | 'enter' | 'newDoc' | 'library' | 'shortcuts';

export const HomeHero: React.FC<HomeHeroProps> = ({
  theme,
  onToggleTheme,
  onStartReading,
  onOpenNewDoc,
  onOpenLibrary,
  onOpenShortcuts,
  onOpenAbout,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<FocusTarget>('enter');

  const executeTarget = useCallback((target: FocusTarget) => {
    if (target === 'theme') onToggleTheme();
    else if (target === 'about') onOpenAbout();
    else if (target === 'enter') onStartReading();
    else if (target === 'newDoc') onOpenNewDoc();
    else if (target === 'library') onOpenLibrary();
    else if (target === 'shortcuts') onOpenShortcuts();
  }, [
    onToggleTheme,
    onOpenAbout,
    onStartReading,
    onOpenNewDoc,
    onOpenLibrary,
    onOpenShortcuts,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]')) return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();

        setSelectedTarget((p) =>
          p === 'newDoc' || p === 'library' || p === 'shortcuts'
            ? 'enter'
            : 'about'
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();

        setSelectedTarget((p) =>
          p === 'about' || p === 'theme'
            ? 'enter'
            : p === 'enter'
              ? 'library'
              : p
        );
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();

        setSelectedTarget((p) =>
          p === 'about'
            ? 'theme'
            : p === 'theme'
              ? 'enter'
              : p === 'enter'
                ? 'newDoc'
                : p === 'shortcuts'
                  ? 'library'
                  : p === 'library'
                    ? 'newDoc'
                    : 'shortcuts'
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();

        setSelectedTarget((p) =>
          p === 'theme'
            ? 'about'
            : p === 'about'
              ? 'about'
              : p === 'enter'
                ? 'shortcuts'
                : p === 'newDoc'
                  ? 'library'
                  : p === 'library'
                    ? 'shortcuts'
                    : 'newDoc'
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        executeTarget(selectedTarget);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [selectedTarget, executeTarget]);

  const cmds: {
    id: FocusTarget;
    key: string;
    label: string;
    action: () => void;
  }[] = [
    {
      id: 'newDoc',
      key: 'N',
      label: 'New Doc',
      action: onOpenNewDoc,
    },
    {
      id: 'library',
      key: 'L',
      label: 'Library',
      action: onOpenLibrary,
    },
    {
      id: 'shortcuts',
      key: '?',
      label: 'Keyboard',
      action: onOpenShortcuts,
    },
  ];

  return (
    <div className="home-hero" tabIndex={-1}>
      <div className="home-pixel-overlay" aria-hidden="true" />

      <div className="home-topbar-left">
        <div className="home-bookmark-brand" title="NOTEBOOK Edition">
          <span className="home-bookmark-text">NOTEBOOK</span>
        </div>
      </div>

      <div className="home-topbar">
        <button
          type="button"
          tabIndex={-1}
          className={`home-theme-btn ${
            theme === 'light' ? 'is-day-mode' : 'is-night-mode'
          } ${selectedTarget === 'theme' ? 'is-arrow-selected' : ''}`}
          onClick={() => {
            setSelectedTarget('theme');
            onToggleTheme();
          }}
          onMouseEnter={() => setSelectedTarget('theme')}
          aria-label={`Toggle Minecraft ${
            theme === 'light' ? 'Night (Dark)' : 'Day (Light)'
          } Mode`}
          title="Cycle Day / Night Mode [T]"
        >
          {theme === 'light' ? (
            <>
              <Sun size={13} className="home-theme-icon" />
              <span>DAY</span>
            </>
          ) : (
            <>
              <Moon size={13} className="home-theme-icon" />
              <span>NIGHT</span>
            </>
          )}

          <span className="home-about-key">T</span>

          {selectedTarget === 'theme' && (
            <span className="mc-arrow-cursor">◄</span>
          )}
        </button>

        <button
          type="button"
          tabIndex={-1}
          className={'home-about-btn ${
            selectedTarget === 'about' ? 'is-arrow-selected' : ''
          }`}
          onClick={() => {
            setSelectedTarget('about');
            onOpenAbout();
          }}
        </buton>
    </div>

    <div className="home-center">
        <div className="home-logo-wrap">
            <h1 className='minecraft-gold-subtitle'>
                KEYBOARD EDITION
        </div>