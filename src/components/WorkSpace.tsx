import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  FileText,
  StickyNote,
} from 'lucide-react';
import type { Document } from '../types';

interface WorkspaceNote {
  id: string;
  sectionId: string;
  quote?: string;
  content?: string;
}

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
  const [selectedArea, setSelectedArea] = useState<
    'sidebar' | 'content'
  >('content');

  const [notes, setNotes] = useState<WorkspaceNote[]>([]);

  const section = document.sections[selectedSection];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        'notebook_annotations_v1'
      );

      if (saved) {
        const all = JSON.parse(saved);

        setNotes(
          all.filter(
            (item: WorkspaceNote & { docId: string }) =>
              item.docId === document.id
          )
        );
      }
    } catch {
      setNotes([]);
    }
  }, [document.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = (
        event.target as HTMLElement
      )?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onBack();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedArea('sidebar');
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedArea('content');
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();

        setSelectedSection((current) =>
          current > 0 ? current - 1 : current
        );

        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();

        setSelectedSection((current) =>
          current < document.sections.length - 1
            ? current + 1
            : current
        );

        return;
      }

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        onOpenLibrary();
        return;
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();

        if (section) {
          const quote =
            section.paragraphs[0] || section.content;

          onAddNote(section.id, quote);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
        true
      );
    };
  }, [
    document.sections,
    onBack,
    onOpenLibrary,
    onAddNote,
    section,
  ]);

  const sectionNotes = notes.filter(
    (note) => note.sectionId === section?.id
  );

  return (
    <div className="workspace">
      <aside
        className={`workspace-sidebar ${
          selectedArea === 'sidebar'
            ? 'is-keyboard-selected'
            : ''
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
                selectedSection === index
                  ? 'is-selected'
                  : ''
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

        <div className="workspace-sidebar-footer">
          <span className="keyboard-key">→</span>
          <span>READING</span>
        </div>
      </aside>

      <main
        className={`workspace-content ${
          selectedArea === 'content'
            ? 'is-keyboard-selected'
            : ''
        }`}
      >
        <div className="workspace-reading-header">
          <div>
            <div className="workspace-reading-category">
              {document.category}
            </div>

            <h1>
              {section?.title || document.title}
            </h1>
          </div>

          <div className="workspace-reading-controls">
            <span className="keyboard-key">N</span>
            <span>NOTE</span>
          </div>
        </div>

        <div className="minecraft-divider" />

        <article className="reading-panel">
          <div className="reading-meta">
            <span>{document.title}</span>
            <span>•</span>
            <span>
              {document.readTimeMinutes} MIN READ
            </span>
          </div>

          <h2 className="reading-title">
            {section?.title || document.title}
          </h2>

          {section?.paragraphs?.map((paragraph, index) => (
            <p
              key={`${section.id}-${index}`}
              className="reading-paragraph"
            >
              {paragraph}
            </p>
          ))}

          <div className="reading-note-hint">
            <StickyNote size={15} />

            <span>
              Press <strong>N</strong> to capture a thought.
            </span>
          </div>
        </article>
      </main>

      <aside className="workspace-margin">
        <div className="margin-panel">
          <div className="margin-title">
            <span>THINKING MARGIN</span>
            <StickyNote size={15} />
          </div>

          {sectionNotes.length === 0 ? (
            <div className="empty-state">
              <StickyNote size={26} />

              <div className="empty-state-title">
                NO NOTES YET
              </div>

              <div className="empty-state-text">
                Press N while reading to capture a thought.
              </div>
            </div>
          ) : (
            sectionNotes.map((note) => (
              <div
                key={note.id}
                className="margin-card margin-card-note"
              >
                <div className="margin-card-type">
                  NOTE
                </div>

                {note.quote && (
                  <div className="margin-card-quote">
                    "{note.quote}"
                  </div>
                )}

                <div className="margin-card-content">
                  {note.content}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="workspace-bottom-hud">
        <span>
          <span className="keyboard-key">↑</span>
          <span className="keyboard-key">↓</span>
          SECTIONS
        </span>

        <span>
          <span className="keyboard-key">←</span>
          <span className="keyboard-key">→</span>
          AREAS
        </span>

        <span>
          <span className="keyboard-key">N</span>
          NOTE
        </span>

        <span>
          <span className="keyboard-key">ESC</span>
          BACK
        </span>
      </div>
    </div>
  );
};