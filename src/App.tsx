import { useEffect, useState } from "react";
import "./App.css";
import type { Annotation, AnnotationType, Document, UserPrefs } from "./types";
import { loadAnnotations, loadDocuments, loadUserPrefs, saveAnnotations, saveDocuments, saveUserPrefs } from "./utils/storage";
import { HomeHero } from "./components/HomeHero";
import { Header } from "./components/Header";
import { Workspace } from "./components/Workspace";
import { Library } from "./components/Library";
import { ReviewMode } from "./components/ReviewMode";
import { Modal } from "./components/Modal";

const defaultPrefs: UserPrefs = {
  theme: "light",
  fontFamily: "serif",
  fontSize: "md",
  zenMode: false,
  showAllMarginAnnotations: false
};

export default function App() {
  const [documents, setDocuments] = useState<Document[]>(loadDocuments());
  const [annotations, setAnnotations] = useState<Annotation[]>(loadAnnotations());
  const [prefs, setPrefs] = useState<UserPrefs>(loadUserPrefs() || defaultPrefs);

  const [view, setView] = useState<"home" | "read" | "review" | "library">("home");
  const [docId, setDocId] = useState(documents[0]?.id || "");
  const [sectionId, setSectionId] = useState(documents[0]?.sections[0]?.id || "");

  const [modal, setModal] = useState<
    "none" | "shortcuts" | "about" | "search" | "new" | "annotation"
  >("none");

  const [annotationType, setAnnotationType] =
    useState<AnnotationType>("note");

  const [selectedQuote, setSelectedQuote] = useState("");

  const document = documents.find(d => d.id === docId) || documents[0];

  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveAnnotations(annotations);
  }, [annotations]);

  useEffect(() => {
    saveUserPrefs(prefs);
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs]);

  const currentSection =
    document?.sections.find(s => s.id === sectionId) ||
    document?.sections[0];

  const addAnnotation = (
    type: AnnotationType,
    content = "",
    quote = selectedQuote
  ) => {
    if (!document || !currentSection) return;

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      docId: document.id,
      sectionId: currentSection.id,
      type,
      quote: quote || undefined,
      content: content || undefined,
      resolved: false,
      createdAt: new Date().toISOString()
    };

    setAnnotations(prev => [annotation, ...prev]);
    setModal("none");
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const toggleQuestion = (id: string) => {
    setAnnotations(prev =>
      prev.map(a =>
        a.id === id ? { ...a, resolved: !a.resolved } : a
      )
    );
  };

  const openAnnotation = (type: AnnotationType) => {
    const quote = window.getSelection()?.toString().trim() || "";
    setSelectedQuote(quote);
    setAnnotationType(type);

    if (type === "highlight" || type === "bookmark") {
      addAnnotation(type, "", quote);
    } else {
      setModal("annotation");
    }
  };

  const toggleTheme = () => {
    setPrefs(prev => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light"
    }));
  };

  const toggleZen = () => {
    setPrefs(prev => ({
      ...prev,
      zenMode: !prev.zenMode
    }));
  };

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        return;
      }

      if (e.key === "Escape") {
        if (modal !== "none") {
          setModal("none");
          return;
        }

        if (view === "review" || view === "read" || view === "library") {
          setView("home");
          return;
        }
      }

      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (view === "home") {
        if (e.key === "Enter" || key === "e") {
          setView("read");
        } else if (key === "n") {
          setModal("new");
        } else if (key === "l") {
          setView("library");
        } else if (key === "a") {
          setModal("about");
        } else if (key === "?" || key === "h") {
          setModal("shortcuts");
        } else if (key === "t") {
          toggleTheme();
        }

        return;
      }

      if (key === "n") openAnnotation("note");
      else if (key === "m") openAnnotation("highlight");
      else if (key === "q") openAnnotation("question");
      else if (key === "b") openAnnotation("bookmark");
      else if (key === "r") setView(v => v === "review" ? "read" : "review");
      else if (key === "l") setView("library");
      else if (key === "/") setModal("search");
      else if (key === "f") toggleZen();
      else if (key === "t") toggleTheme();
      else if (key === "?" || key === "h") setModal("shortcuts");
      else if (key === "1") setView("read");
      else if (key === "2") setView("review");
      else if (key === "3") setView("library");
    };

    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [view, modal, selectedQuote]);

  if (!document) {
    return (
      <div className="app">
        <HomeHero
          theme={prefs.theme}
          onToggleTheme={toggleTheme}
          onStartReading={() => setModal("new")}
          onOpenNewDoc={() => setModal("new")}
          onOpenLibrary={() => setView("library")}
          onOpenShortcuts={() => setModal("shortcuts")}
          onOpenAbout={() => setModal("about")}
        />
      </div>
    );
  }

  return (
    <div className={`app ${prefs.zenMode ? "zen-mode" : ""}`}>
      {view !== "home" && (
        <Header
          document={document}
          theme={prefs.theme}
          zenMode={prefs.zenMode}
          onToggleTheme={toggleTheme}
          onToggleZen={toggleZen}
          onOpenLibrary={() => setView("library")}
          onOpenSearch={() => setModal("search")}
          onOpenShortcuts={() => setModal("shortcuts")}
          onBack={() => setView("home")}
        />
      )}

      {view === "home" && (
        <HomeHero
          theme={prefs.theme}
          onToggleTheme={toggleTheme}
          onStartReading={() => setView("read")}
          onOpenNewDoc={() => setModal("new")}
          onOpenLibrary={() => setView("library")}
          onOpenShortcuts={() => setModal("shortcuts")}
          onOpenAbout={() => setModal("about")}
        />
      )}

      {view === "read" && (
        <Workspace
          document={document}
          sectionId={sectionId}
          annotations={annotations}
          prefs={prefs}
          onSectionChange={setSectionId}
          onAddAnnotation={openAnnotation}
          onDeleteAnnotation={deleteAnnotation}
          onToggleQuestion={toggleQuestion}
          onToggleShowAll={() =>
            setPrefs(p => ({
              ...p,
              showAllMarginAnnotations: !p.showAllMarginAnnotations
            }))
          }
          onOpenLibrary={() => setView("library")}
        />
      )}

      {view === "review" && (
        <ReviewMode
          document={document}
          annotations={annotations}
          onSelectSection={id => {
            setSectionId(id);
            setView("read");
          }}
          onReturnToReading={() => setView("read")}
          onToggleResolveQuestion={toggleQuestion}
          onDeleteAnnotation={deleteAnnotation}
        />
      )}

      {view === "library" && (
        <Library
          documents={documents}
          activeDocId={docId}
          onSelect={id => {
            setDocId(id);
            const doc = documents.find(d => d.id === id);
            setSectionId(doc?.sections[0]?.id || "");
            setView("read");
          }}
          onNew={() => setModal("new")}
          onDelete={id => {
            setDocuments(prev => prev.filter(d => d.id !== id));
          }}
          onBack={() => setView("home")}
        />
      )}

      {modal !== "none" && (
        <Modal
          type={modal}
          annotationType={annotationType}
          quote={selectedQuote}
          documents={documents}
          onClose={() => setModal("none")}
          onSaveAnnotation={content =>
            addAnnotation(annotationType, content)
          }
          onCreateDocument={doc => {
            setDocuments(prev => [doc, ...prev]);
            setDocId(doc.id);
            setSectionId(doc.sections[0]?.id || "");
            setModal("none");
            setView("read");
          }}
        />
      )}
    </div>
  );
}