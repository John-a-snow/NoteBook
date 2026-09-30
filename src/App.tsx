import { useEffect, useMemo, useState } from "react";
import type {
  ActiveView,
  Annotation,
  AnnotationType,
  Document,
  UserPrefs,
} from "./types";
import { HomeHero } from "./components/HomeHero";
import { Workspace } from "./components/Workspace";
import { Library } from "./components/Library";
import { ReviewMode } from "./components/ReviewMode";
import {
  AboutModal,
  NewDocumentModal,
  ShortcutsModal,
} from "./components/Modal";
import {
  DEFAULT_PREFS,
  loadAnnotations,
  loadDocuments,
  loadUserPrefs,
  saveAnnotations,
  saveDocuments,
  saveUserPrefs,
} from "./utils/storage";

const sampleDocument: Document = {
  id: "sample-document",
  title: "The Art of Reading",
  author: "NOTEBOOK",
  category: "READING",
  readTimeMinutes: 5,
  createdAt: new Date().toISOString(),
  isSample: true,
  lastReadSectionId: "section-1",
  sections: [
    {
      id: "section-1",
      title: "BEGINNING",
      content:
        "Reading is more than moving through words. It is a way of slowing down and giving attention to an idea.",
      paragraphs: [
        "Reading is more than moving through words. It is a way of slowing down and giving attention to an idea.",
        "A good reader does not simply collect information. They question it, connect it with what they already know, and notice the details that matter."
      ],
    },
    {
      id: "section-2",
      title: "THINKING",
      content:
        "The most useful ideas are often the ones that make us stop and think.",
      paragraphs: [
        "The most useful ideas are often the ones that make us stop and think.",
        "Writing a short note beside an important passage can turn passive reading into an active conversation with the text."
      ],
    },
    {
      id: "section-3",
      title: "REMEMBERING",
      content:
        "Annotations create small landmarks that make it easier to return to an idea later.",
      paragraphs: [
        "Annotations create small landmarks that make it easier to return to an idea later.",
        "A highlight can mark an important sentence. A question can capture uncertainty. A bookmark can simply say: come back here."
      ],
    },
  ],
};

function App() {
  const [view, setView] = useState<ActiveView>("home");

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = loadDocuments();
    return saved.length ? saved : [sampleDocument];
  });

  const [activeDocId, setActiveDocId] = useState(
    () => documents[0]?.id || sampleDocument.id
  );

  const [annotations, setAnnotations] =
    useState<Annotation[]>(loadAnnotations);

  const [prefs, setPrefs] = useState<UserPrefs>(
    loadUserPrefs
  );

  const [modal, setModal] = useState<
    "new" | "shortcuts" | "about" | null
  >(null);

  const activeDocument = useMemo(
    () =>
      documents.find(
        document => document.id === activeDocId
      ) || documents[0] || sampleDocument,
    [documents, activeDocId]
  );

  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveAnnotations(annotations);
  }, [annotations]);

  useEffect(() => {
    saveUserPrefs(prefs);

    document.documentElement.dataset.theme =
      prefs.theme;
  }, [prefs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        if (modal) {
          setModal(null);
          return;
        }

        if (view !== "home") {
          setView("home");
        }

        return;
      }

      if (view === "home") {
        if (key === "n") setModal("new");
        if (key === "l") setView("library");
        if (key === "a") setModal("about");
        if (key === "?") setModal("shortcuts");

        if (event.key === "Enter") {
          setView("read");
        }
      }

      if (view === "read") {
        if (key === "l") setView("library");
        if (key === "r") setView("review");
        if (key === "t") toggleTheme();
        if (key === "f") toggleZen();
        if (key === "?") setModal("shortcuts");
      }

      if (view === "review") {
        if (key === "l") setView("library");
        if (key === "1") setView("read");
      }

      if (view === "library") {
        if (key === "n") setModal("new");
        if (key === "1") setView("read");
        if (key === "?") setModal("shortcuts");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [view, modal, prefs.theme]);

  const toggleTheme = () => {
    setPrefs(current => ({
      ...current,
      theme:
        current.theme === "light"
          ? "dark"
          : "light",
    }));
  };

  const toggleZen = () => {
    setPrefs(current => ({
      ...current,
      zenMode: !current.zenMode,
    }));
  };

  const openDocument = (id: string) => {
    setActiveDocId(id);
    setView("read");
  };

  const createDocument = (
    title: string,
    author: string,
    category: string,
    content: string
  ) => {
    const paragraphs = content
      .split(/\n+/)
      .map(value => value.trim())
      .filter(Boolean);

    const sections = [
      {
        id: `section-${Date.now()}`,
        title: "SECTION 1",
        content: paragraphs.join("\n\n"),
        paragraphs:
          paragraphs.length
            ? paragraphs
            : ["No content provided."],
      },
    ];

    const words = content
      .split(/\s+/)
      .filter(Boolean).length;

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      title: title.trim() || "Untitled Reading",
      author: author.trim() || "Anonymous",
      category: category.trim() || "ARTICLE",
      readTimeMinutes: Math.max(
        1,
        Math.ceil(words / 200)
      ),
      sections,
      lastReadSectionId: sections[0].id,
      createdAt: new Date().toISOString(),
    };

    setDocuments(current => [
      ...current,
      newDocument,
    ]);

    setActiveDocId(newDocument.id);
    setModal(null);
    setView("read");
  };

  const deleteDocument = (id: string) => {
    const document = documents.find(
      item => item.id === id
    );

    if (!document || document.isSample) return;

    const nextDocuments = documents.filter(
      item => item.id !== id
    );

    setDocuments(
      nextDocuments.length
        ? nextDocuments
        : [sampleDocument]
    );

    if (activeDocId === id) {
      setActiveDocId(
        nextDocuments[0]?.id ||
          sampleDocument.id
      );
      setView("library");
    }

    setAnnotations(current =>
      current.filter(
        annotation => annotation.docId !== id
      )
    );
  };

  const addAnnotation = (
    type: AnnotationType,
    sectionId: string,
    quote?: string,
    content?: string
  ) => {
    const annotation: Annotation = {
      id: `annotation-${Date.now()}`,
      docId: activeDocument.id,
      sectionId,
      type,
      quote,
      content,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    setAnnotations(current => [
      ...current,
      annotation,
    ]);
  };

  const toggleResolveQuestion = (id: string) => {
    setAnnotations(current =>
      current.map(annotation =>
        annotation.id === id
          ? {
              ...annotation,
              resolved: !annotation.resolved,
            }
          : annotation
      )
    );
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(current =>
      current.filter(
        annotation => annotation.id !== id
      )
    );
  };

  const selectSection = (id: string) => {
    setDocuments(current =>
      current.map(document =>
        document.id === activeDocument.id
          ? {
              ...document,
              lastReadSectionId: id,
            }
          : document
      )
    );
  };

  if (view === "home") {
    return (
      <>
        <HomeHero
          theme={prefs.theme}
          onToggleTheme={toggleTheme}
          onStartReading={() => setView("read")}
          onOpenNewDoc={() => setModal("new")}
          onOpenLibrary={() => setView("library")}
          onOpenShortcuts={() =>
            setModal("shortcuts")
          }
          onOpenAbout={() => setModal("about")}
        />

        {modal === "new" && (
          <NewDocumentModal
            onClose={() => setModal(null)}
            onCreate={createDocument}
          />
        )}

        {modal === "shortcuts" && (
          <ShortcutsModal
            onClose={() => setModal(null)}
          />
        )}

        {modal === "about" && (
          <AboutModal
            onClose={() => setModal(null)}
          />
        )}
      </>
    );
  }

  if (view === "library") {
    return (
      <>
        <Library
          documents={documents}
          activeDocId={activeDocId}
          onSelect={openDocument}
          onNew={() => setModal("new")}
          onDelete={deleteDocument}
          onBack={() => setView("home")}
        />

        {modal === "new" && (
          <NewDocumentModal
            onClose={() => setModal(null)}
            onCreate={createDocument}
          />
        )}

        {modal === "shortcuts" && (
          <ShortcutsModal
            onClose={() => setModal(null)}
          />
        )}
      </>
    );
  }

  if (view === "review") {
    return (
      <ReviewMode
        document={activeDocument}
        annotations={annotations}
        onSelectSection={id => {
          selectSection(id);
          setView("read");
        }}
        onReturnToReading={() =>
          setView("read")
        }
        onToggleResolveQuestion={
          toggleResolveQuestion
        }
        onDeleteAnnotation={deleteAnnotation}
      />
    );
  }

  return (
    <>
      <Workspace
        document={activeDocument}
        annotations={annotations}
        fontFamily={prefs.fontFamily}
        fontSize={prefs.fontSize}
        zenMode={prefs.zenMode}
        theme={prefs.theme}
        onToggleTheme={toggleTheme}
        onToggleZen={toggleZen}
        onOpenLibrary={() =>
          setView("library")
        }
        onOpenSearch={() => {}}
        onOpenShortcuts={() =>
          setModal("shortcuts")
        }
        onBack={() => setView("home")}
        onOpenReview={() =>
          setView("review")
        }
        onAddAnnotation={addAnnotation}
        onSelectSection={selectSection}
      />

      {modal === "shortcuts" && (
        <ShortcutsModal
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

export default App;