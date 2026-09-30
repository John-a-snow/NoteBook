import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  CircleHelp,
  FileText,
  Highlighter,
  MessageSquare,
  Trash2,
} from "lucide-react";
import type {
  Annotation,
  AnnotationType,
  Document,
} from "../types";

interface ReviewModeProps {
  document: Document;
  annotations: Annotation[];
  onSelectSection: (id: string) => void;
  onReturnToReading: () => void;
  onToggleResolveQuestion: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

type FilterType = "all" | AnnotationType;

const labels: Record<AnnotationType, string> = {
  note: "NOTE",
  highlight: "HIGHLIGHT",
  question: "QUESTION",
  bookmark: "BOOKMARK",
};

function AnnotationIcon({
  type,
}: {
  type: AnnotationType;
}) {
  if (type === "note") {
    return <MessageSquare size={16} />;
  }

  if (type === "highlight") {
    return <Highlighter size={16} />;
  }

  if (type === "question") {
    return <CircleHelp size={16} />;
  }

  return <Bookmark size={16} />;
}

export function ReviewMode({
  document,
  annotations,
  onSelectSection,
  onReturnToReading,
  onToggleResolveQuestion,
  onDeleteAnnotation,
}: ReviewModeProps) {
  const [filter, setFilter] =
    useState<FilterType>("all");

  const documentAnnotations = useMemo(
    () =>
      annotations.filter(
        annotation =>
          annotation.docId === document.id
      ),
    [annotations, document.id]
  );

  const filteredAnnotations = useMemo(() => {
    if (filter === "all") {
      return documentAnnotations;
    }

    return documentAnnotations.filter(
      annotation => annotation.type === filter
    );
  }, [documentAnnotations, filter]);

  const getSectionTitle = (sectionId: string) =>
    document.sections.find(
      section => section.id === sectionId
    )?.title || "Unknown section";

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

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        setFilter(current => {
          const filters: FilterType[] = [
            "all",
            "note",
            "highlight",
            "question",
            "bookmark",
          ];

          const index = filters.indexOf(current);

          return filters[
            index <= 0
              ? filters.length - 1
              : index - 1
          ];
        });
      }

      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();

        setFilter(current => {
          const filters: FilterType[] = [
            "all",
            "note",
            "highlight",
            "question",
            "bookmark",
          ];

          const index = filters.indexOf(current);

          return filters[
            index >= filters.length - 1
              ? 0
              : index + 1
          ];
        });
      }

      if (event.key === "Enter") {
        event.preventDefault();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onReturnToReading();
      }

      if (event.key.toLowerCase() === "r") {
        onReturnToReading();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [onReturnToReading]);

  return (
    <main className="library review-mode pixel-texture">
      <div className="library-header">
        <div>
          <button
            className="pixel-button"
            onClick={onReturnToReading}
            tabIndex={-1}
          >
            <ArrowLeft size={14} />
            BACK TO READING
          </button>

          <h1
            className="screen-title"
            style={{ marginTop: 22 }}
          >
            REVIEW
          </h1>

          <p className="screen-subtitle">
            {document.title} ·{" "}
            {documentAnnotations.length} annotation
            {documentAnnotations.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        <div className="library-header-key">
          <span className="keyboard-key">R</span>
          <span>READ</span>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <button
          className={`pixel-button ${
            filter === "all"
              ? "pixel-button-gold"
              : ""
          }`}
          onClick={() => setFilter("all")}
          tabIndex={-1}
        >
          ALL
        </button>

        <button
          className={`pixel-button ${
            filter === "note"
              ? "pixel-button-gold"
              : ""
          }`}
          onClick={() => setFilter("note")}
          tabIndex={-1}
        >
          <MessageSquare size={14} />
          NOTES
        </button>

        <button
          className={`pixel-button ${
            filter === "highlight"
              ? "pixel-button-gold"
              : ""
          }`}
          onClick={() =>
            setFilter("highlight")
          }
          tabIndex={-1}
        >
          <Highlighter size={14} />
          HIGHLIGHTS
        </button>

        <button
          className={`pixel-button ${
            filter === "question"
              ? "pixel-button-gold"
              : ""
          }`}
          onClick={() => setFilter("question")}
          tabIndex={-1}
        >
          <CircleHelp size={14} />
          QUESTIONS
        </button>

        <button
          className={`pixel-button ${
            filter === "bookmark"
              ? "pixel-button-gold"
              : ""
          }`}
          onClick={() => setFilter("bookmark")}
          tabIndex={-1}
        >
          <Bookmark size={14} />
          BOOKMARKS
        </button>
      </div>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 14,
          paddingBottom: 80,
        }}
      >
        {filteredAnnotations.length === 0 ? (
          <div className="empty-state minecraft-border">
            <div className="empty-state-title">
              NO ANNOTATIONS YET
            </div>

            <div className="empty-state-text">
              Add notes, highlights, questions or
              bookmarks while reading.
            </div>
          </div>
        ) : (
          filteredAnnotations.map(annotation => {
            const isQuestion =
              annotation.type === "question";

            const resolved = Boolean(
              annotation.resolved
            );

            return (
              <article
                key={annotation.id}
                className={`margin-card ${
                  annotation.type === "note"
                    ? "margin-card-note"
                    : ""
                }`}
                style={{
                  opacity: resolved ? 0.65 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    className="margin-card-type"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <AnnotationIcon
                      type={annotation.type}
                    />
                    {labels[annotation.type]}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <button
                      className="pixel-button"
                      onClick={() =>
                        onSelectSection(
                          annotation.sectionId
                        )
                      }
                      tabIndex={-1}
                      title="Open section"
                    >
                      <FileText size={13} />
                      OPEN
                    </button>

                    {isQuestion && (
                      <button
                        className="pixel-button"
                        onClick={() =>
                          onToggleResolveQuestion(
                            annotation.id
                          )
                        }
                        tabIndex={-1}
                      >
                        {resolved ? (
                          <>
                            <CheckCircle2
                              size={13}
                            />
                            RESOLVED
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            RESOLVE
                          </>
                        )}
                      </button>
                    )}

                    <button
                      className="pixel-button"
                      onClick={() =>
                        onDeleteAnnotation(
                          annotation.id
                        )
                      }
                      tabIndex={-1}
                      title="Delete annotation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 8,
                    color: "var(--text-muted)",
                    fontSize: 10,
                  }}
                >
                  {getSectionTitle(
                    annotation.sectionId
                  )}
                </div>

                {annotation.quote && (
                  <div className="margin-card-quote">
                    "{annotation.quote}"
                  </div>
                )}

                {annotation.content && (
                  <div className="margin-card-content">
                    {annotation.content}
                  </div>
                )}

                {!annotation.content &&
                  !annotation.quote && (
                    <div className="margin-card-content">
                      {annotation.type ===
                      "bookmark"
                        ? "Saved location"
                        : labels[
                            annotation.type
                          ]}
                    </div>
                  )}
              </article>
            );
          })
        )}
      </section>

      <div className="workspace-bottom-hud">
        <span className="keyboard-key">
          ↑
        </span>
        <span className="keyboard-key">
          ↓
        </span>
        <span>FILTER</span>

        <span className="keyboard-key">
          ENTER
        </span>
        <span>SELECT</span>

        <span className="keyboard-key">R</span>
        <span>READ</span>

        <span className="keyboard-key">
          ESC
        </span>
        <span>BACK</span>
      </div>
    </main>
  );
}