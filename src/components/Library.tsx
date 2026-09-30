import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, FileText } from 'lucide-react';
import type { Document } from '../types';

interface LibraryProps {
  documents: Document[];
  onOpenDocument: (document: Document) => void;
  onBack: () => void;
}

export const Library: React.FC<LibraryProps> = ({
  documents,
  onOpenDocument,
  onBack,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]')) return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();

        setSelectedIndex((current) =>
          current < documents.length - 1 ? current + 1 : current
        );

        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();

        setSelectedIndex((current) =>
          current > 0 ? current - 1 : current
        );

        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();

        setSelectedIndex((current) =>
          current < documents.length - 1 ? current + 1 : current
        );

        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();

        setSelectedIndex((current) =>
          current > 0 ? current - 1 : current
        );

        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();

        const selectedDocument = documents[selectedIndex];

        if (selectedDocument) {
          onOpenDocument(selectedDocument);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [documents, selectedIndex, onOpenDocument, onBack]);

  return (
    <main className="library">
      <div className="library-header">
        <div>
          <div className="screen-title">LIBRARY</div>

          <div className="screen-subtitle">
            SELECT A DOCUMENT TO BEGIN READING
          </div>
        </div>

        <div className="library-header-key">
          <span className="keyboard-key">ESC</span>
          <span>BACK</span>
        </div>
      </div>