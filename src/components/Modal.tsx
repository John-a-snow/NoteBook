import { useEffect, useState } from "react";
import { X, Plus, HelpCircle, Info } from "lucide-react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({
  title,
  children,
  onClose,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div
        className="modal minecraft-border"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title pixel-font">
            {title}
          </h2>

          <button
            className="pixel-button"
            onClick={onClose}
            tabIndex={-1}
          >
            <X size={14} />
            ESC
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

interface NewDocumentModalProps {
  onClose: () => void;
  onCreate: (
    title: string,
    author: string,
    category: string,
    content: string
  ) => void;
}

export function NewDocumentModal({
  onClose,
  onCreate,
}: NewDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const create = () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    onCreate(
      title.trim(),
      author.trim(),
      category.trim(),
      content
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "enter"
      ) {
        event.preventDefault();
        create();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [title, author, category, content]);

  return (
    <Modal
      title="NEW DOCUMENT"
      onClose={onClose}
    >
      <div className="note-panel">
        <label htmlFor="document-title">
          DOCUMENT TITLE
        </label>

        <input
          id="document-title"
          value={title}
          onChange={event =>
            setTitle(event.target.value)
          }
          placeholder="Enter title..."
          autoFocus
        />

        <label htmlFor="document-author">
          AUTHOR
        </label>

        <input
          id="document-author"
          value={author}
          onChange={event =>
            setAuthor(event.target.value)
          }
          placeholder="Author name..."
        />

        <label htmlFor="document-category">
          CATEGORY
        </label>

        <input
          id="document-category"
          value={category}
          onChange={event =>
            setCategory(event.target.value)
          }
          placeholder="Article, Book, Notes..."
        />

        <label htmlFor="document-content">
          CONTENT
        </label>

        <textarea
          id="document-content"
          value={content}
          onChange={event =>
            setContent(event.target.value)
          }
          placeholder="Paste or type your reading content here..."
          rows={10}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            className="pixel-button"
            onClick={onClose}
            tabIndex={-1}
          >
            CANCEL
          </button>

          <button
            className="pixel-button pixel-button-gold"
            onClick={create}
            tabIndex={-1}
          >
            <Plus size={14} />
            CREATE
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          CTRL + ENTER · CREATE
        </div>
      </div>
    </Modal>
  );
}

interface ShortcutsModalProps {
  onClose: () => void;
}

export function ShortcutsModal({
  onClose,
}: ShortcutsModalProps) {
  const shortcuts = [
    ["↑ ↓ ← →", "Navigate"],
    ["ENTER", "Select / Open"],
    ["ESC", "Back / Close"],
    ["N", "New document"],
    ["L", "Library"],
    ["/", "Search"],
    ["F", "Focus mode"],
    ["T", "Theme"],
    ["R", "Review"],
    ["1", "Reading"],
    ["3", "Library"],
    ["?", "Shortcuts"],
  ];

  return (
    <Modal
      title="KEYBOARD SHORTCUTS"
      onClose={onClose}
    >
      <div
        style={{
          display: "grid",
          gap: 8,
        }}
      >
        {shortcuts.map(([key, description]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              padding: "8px 10px",
              border: "2px solid var(--border)",
              background: "var(--surface-inset)",
            }}
          >
            <span>{description}</span>

            <span className="keyboard-key">
              {key}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({
  onClose,
}: AboutModalProps) {
  return (
    <Modal
      title="ABOUT NOTEBOOK"
      onClose={onClose}
    >
      <div className="note-panel">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Info size={18} />

          <h3
            className="pixel-font"
            style={{
              fontSize: 13,
            }}
          >
            NOTEBOOK
          </h3>
        </div>

        <p>
          A keyboard-first reading and annotation
          workspace.
        </p>

        <p>
          Read documents, save notes, highlight
          important passages, create questions,
          bookmark sections, and review everything
          from one place.
        </p>

        <p
          style={{
            color: "var(--text-muted)",
          }}
        >
          MOUSE? NOT REQUIRED.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
            color: "var(--text-muted)",
          }}
        >
          <HelpCircle size={14} />
          Press ? anytime to view shortcuts.
        </div>
      </div>
    </Modal>
  );
}