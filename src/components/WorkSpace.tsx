import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, StickyNote } from 'lucide-react';
import type { Document } from '../types';

interface WorkspaceProps {
  document: Document;
  onBack: () => void;
  onOpenLibrary: () => void;
  onAddNote: (sectionId: string, quote: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  document,
  onBack,
  onOpenLibrary,
  onAddNote,
}) => {
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedArea, setSelectedArea] = useState<'sidebar' | 'content'>(
    'content'
  );

  const section = document.sections[selectedSection];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedArea('sidebar');
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedArea('content');
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();

        setSelectedSection((current) =>
          current > 0 ? current - 1 : current
        );

        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();

        setSelectedSection((current) =>
          current < document.sections.length - 1
            ? current + 1
            : current
        );

        return;
      }

      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onOpenLibrary();
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();

        if (section) {
          const quote = section.paragraphs[0] || section.content;
          onAddNote(section.id, quote);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    document.sections,
    onBack,
    onOpenLibrary,
    onAddNote,
    section,
  ]);

  return (
    <div className="workspace">
      <aside
        className={`workspace-sidebar ${
          selectedArea === 'sidebar' ? 'is-keyboard-selected' : ''
        }`}
      >
        <div className="workspace-sidebar-title">
          <BookOpen size={15} />
          <span>DOCUMENT</span>
        </div>

        <div className="minecraft-divider" />

        <div className="workspace-document-info">
          <div className="workspace-document-icon">
            <FileText size={22} />
          </div>

          <div className="workspace-document-title">
            {document.title}
          </div>

          <div className="workspace-document-author">
            {document.author}
          </div>
        </div>

        <div className="workspace-sections">
          {document.sections.map((item, index) => (
            <button
              key={item.id}
              type="button"
              tabIndex={-1}
              className={`workspace-section-item ${
                selectedSection === index ? 'is-selected' : ''
              }`}
              onClick={() => {
                setSelectedSection(index);
                setSelectedArea('sidebar');
              }}
            >
              <span className="workspace-section-number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span>{item.title}</span>
            </button>
          ))}
        </div>