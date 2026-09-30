import React, { useState, useEffect, useCallback, use } from 'react';
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
    onOpenShortucts,
    onOpenAbout,
}) => {
    const [selectedTarget, setSelectedTarget] = useState<FocusTarget>('enter');

    const executeTarget = useCallback((target: FocusTarget) => {
        if (target === 'theme') onToggleTheme();
        else if (target === 'enter' ) onStartReading();
        else if (target === 'about' ) onOpenAbout();
        else if (target === 'newDoc') onOpenNewDoc();
        else if (target === 'library') onOpenLibrary();
        else if(target === 'shortcuts') onOpenShortucts();
    }, [
      onToggleTheme,
      onOpenAbout,
      onStartReading,
      onOpenNewDoc,
      onOpenLibrary,
      onOpenShortucts,
    ]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.querySelector('[role="dialog"]')) return;

            const tag = e.target as HTMLElement)?.tagName?.toLowerCase();

            if (tag === 'input' || tag === 'textarea') return;

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropogation();

                setSelectedTarget((p) =>
                    p === 'newDoc' || p === 'library' || p === 'shortcuts'
                      ? 'enter'
                      : 'about'
                );
            ) else if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();

                setSelectedTarget((p) =>
                    p === 'about' || p === 'library' || p === 'shortcuts'