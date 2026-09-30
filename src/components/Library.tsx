import { useEffect, useState } from "react";
import {
  BookOpen,
  FilePlus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import type { Document } from "../types";

interface LibraryProps {
  documents: Document[];
  activeDocId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function Library({
  documents,
  activeDocId,
  onSelect,
  onNew,
  onDelete,
  onBack,
}: LibraryProps) {
  const [selected, setSelected] = useState(
    Math.max(
      0,
      documents.findIndex(doc => doc.id === activeDocId)
    )
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

      if (!documents.length) return;

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        setSelected(value =>
          value <= 0 ? documents.length - 1 : value - 1
        );
      }

      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();

        setSelected(value =>
          value >= documents.length - 1 ? 0 : value + 1
        );
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const document = documents[selected];

        if (document) {
          onSelect(document.id);
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }

      if (event.key.toLowerCase() === "n") {
        onNew();
      }

      if (event.key.toLowerCase() === "d") {
        const document = documents[selected];

        if (document && !document.isSample) {
          onDelete(document.id);

          setSelected(value =>
            Math.min(value, Math.max(0, documents.length - 2))
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [documents, selected, onSelect, onNew, onDelete, onBack]);

  return (
    <main className="library pixel-texture">
      <div className="library-header">
        <div>
          <button
            className="pixel-button"
            onClick={onBack}
            tabIndex={-1}
          >
            <ArrowLeft size={14} />
            BACK
          </button>

          <h1
            className="screen-title"
            style={{ marginTop: 22 }}
          >
            LIBRARY
          </h1>

          <p className="screen-subtitle">
            Your saved reading documents
          </p>
        </div>

        <button
          className="pixel-button pixel-button-gold"
          onClick={onNew}
          tabIndex={-1}
        >
          <FilePlus size={14} />
          N · NEW DOCUMENT
        </button>
      </div>

      {documents.length === 0 ? (
        <div
          className="empty-state minecraft-border"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <div className="empty-state-title">
            LIBRARY IS EMPTY
          </div>

          <div className="empty-state-text">
            Press N to create a new document.
          </div>

          <button
            className="pixel-button pixel-button-gold"
            onClick={onNew}
            tabIndex={-1}
            style={{ marginTop: 18 }}
          >
            <FilePlus size={14} />
            CREATE DOCUMENT
          </button>
        </div>
      ) : (
        <div className="library-grid">
          {documents.map((document, index) => {
            const isSelected = index === selected;
            const isActive = document.id === activeDocId;

            return (
              <article
                key={document.id}
                className={`library-card ${
                  isSelected ? "selected keyboard-focus" : ""
                }`}
                onClick={() => onSelect(document.id)}
              >
                {isActive && (
                  <div className="library-card-selection">
                    ACTIVE
                  </div>
                )}

                <div className="library-card-icon">
                  <BookOpen size={18} />
                </div>

                <div className="library-card-title">
                  {document.title}
                </div>

                <div className="library-card-author">
                  {document.author}
                </div>

                <div className="library-card-meta">
                  <span>{document.category}</span>
                  <span>
                    {document.readTimeMinutes} MIN
                  </span>
                  <span>
                    {document.sections.length} SECTIONS
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 18,
                  }}
                >
                  <button
                    className="pixel-button"
                    onClick={event => {
                      event.stopPropagation();
                      onSelect(document.id);
                    }}
                    tabIndex={-1}
                  >
                    OPEN
                  </button>

                  {!document.isSample && (
                    <button
                      className="pixel-button"
                      onClick={event => {
                        event.stopPropagation();
                        onDelete(document.id);
                      }}
                      tabIndex={-1}
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="library-bottom-hud">
        <span className="keyboard-key">↑</span>
        <span className="keyboard-key">↓</span>
        <span>NAVIGATE</span>

        <span className="keyboard-key">ENTER</span>
        <span>OPEN</span>

        <span className="keyboard-key">N</span>
        <span>NEW</span>

        <span className="keyboard-key">ESC</span>
        <span>BACK</span>
      </div>
    </main>
  );
}