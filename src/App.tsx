import React, { useEffect, useState } from 'react';
import { HomeHero } from './components/HomeHero';
import { Header } from './components/Header';
import { Workspace } from './components/Workspace';
import { Library } from './components/Library';
import { NotePanel } from './components/NotePanel';
import { Modal } from './components/Modal';
import type { ActiveView, Annotation, Document, UserPrefs } from './types';
import {
  loadAnnotations,
  loadDocuments,
  loadUserPrefs,
  saveAnnotations,
  saveDocuments,
  saveUserPrefs,
} from './utils/storage';
import { sampleDocuments } from './data/documents';

const defaultPrefs: UserPrefs = {
  theme: 'light',
  fontFamily: 'serif',
  fontSize: 'md',
  zenMode: false,
  showAllMarginAnnotations: false,
};

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = loadDocuments();
    return saved.length ? saved : sampleDocuments;
  });

  const [annotations, setAnnotations] = useState<Annotation[]>(() =>
    loadAnnotations()
  );

  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() => ({
    ...defaultPrefs,
    ...loadUserPrefs(),
  }));

  const [activeView, setActiveView] = useState<ActiveView>('home');

  const [activeDocId, setActiveDocId] = useState<string>(
    () => documents[0]?.id || ''
  );

  const [notePanelOpen, setNotePanelOpen] = useState(false);
  const [noteSectionId, setNoteSectionId] = useState('');
  const [noteQuote, setNoteQuote] = useState('');

  const [aboutOpen, setAboutOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const activeDocument =
    documents.find((document) => document.id === activeDocId) ||
    documents[0];

  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveAnnotations(annotations);
  }, [annotations]);

  useEffect(() => {
    saveUserPrefs(userPrefs);
    document.documentElement.setAttribute(
      'data-theme',
      userPrefs.theme
    );
  }, [userPrefs]);

  const toggleTheme = () => {
    setUserPrefs((current) => ({
      ...current,
      theme: current.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const openDocument = (document: Document) => {
    setActiveDocId(document.id);
    setActiveView('read');
  };

  const openNotePanel = (sectionId: string, quote: string) => {
    setNoteSectionId(sectionId);
    setNoteQuote(quote);
    setNotePanelOpen(true);
  };

  const saveNote = (content: string) => {
    if (!activeDocument) return;

    const newNote: Annotation = {
      id: `note-${Date.now()}`,
      docId: activeDocument.id,
      sectionId: noteSectionId,
      type: 'note',
      quote: noteQuote,
      content,
      createdAt: new Date().toISOString(),
    };

    setAnnotations((current) => [newNote, ...current]);
    setNotePanelOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        return;
      }

      const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      if (event.key === 'Escape') {
        if (notePanelOpen) {
          setNotePanelOpen(false);
          return;
        }

        if (aboutOpen) {
          setAboutOpen(false);
          return;
        }

        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }

        if (activeView !== 'home') {
          setActiveView('home');
          return;
        }
      }

      if (activeView === 'home') {
        if (event.key === 'a' || event.key === 'A') {
          event.preventDefault();
          setAboutOpen(true);
        }

        if (event.key === '?' || event.key === 'h') {
          event.preventDefault();
          setShortcutsOpen(true);
        }

        if (event.key === 'l' || event.key === 'L') {
          event.preventDefault();
          setActiveView('library');
        }

        if (event.key === 't' || event.key === 'T') {
          event.preventDefault();
          toggleTheme();
        }

        return;
      }

      if (event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        setActiveView('library');
      }

      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        toggleTheme();
      }

      if (event.key === '?' || event.key === 'h') {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    activeView,
    aboutOpen,
    shortcutsOpen,
    notePanelOpen,
    userPrefs.theme,
  ]);

  if (!activeDocument && activeView === 'read') {
    setActiveView('library');
    return null;
  }

  return (
    <div className="app">
      {activeView === 'home' ? (
        <HomeHero
          theme={userPrefs.theme}
          onToggleTheme={toggleTheme}
          onStartReading={() => setActiveView('read')}
          onOpenNewDoc={() => setActiveView('library')}
          onOpenLibrary={() => setActiveView('library')}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenAbout={() => setAboutOpen(true)}
        />
      ) : (
        <div className="app-shell">
          <Header
            theme={userPrefs.theme}
            title={
              activeView === 'library'
                ? 'LIBRARY'
                : activeDocument?.title || 'NOTEBOOK'
            }
            onToggleTheme={toggleTheme}
            onOpenLibrary={() => setActiveView('library')}
            onBack={() => setActiveView('home')}
          />

          <main className="app-main">
            {activeView === 'library' ? (
              <Library
                documents={documents}
                onOpenDocument={openDocument}
                onBack={() => setActiveView('home')}
              />
            ) : (
              activeDocument && (
                <Workspace
                  document={activeDocument}
                  onBack={() => setActiveView('home')}
                  onOpenLibrary={() => setActiveView('library')}
                  onAddNote={openNotePanel}
                />
              )
            )}
          </main>
        </div>
      )}

      <NotePanel
        open={notePanelOpen}
        quote={noteQuote}
        onSave={saveNote}
        onClose={() => setNotePanelOpen(false)}
      />

      <Modal
        open={aboutOpen}
        title="ABOUT NOTEBOOK"
        onClose={() => setAboutOpen(false)}
      >
        <div className="about-content">
          <div className="about-logo">NOTEBOOK</div>

          <p>
            A keyboard-first reading and note-taking workspace.
          </p>

          <p>
            Read without losing your thoughts.
          </p>

          <div className="about-flow">
            READ → THINK → NOTE
          </div>
        </div>
      </Modal>

      <Modal
        open={shortcutsOpen}
        title="KEYBOARD CONTROLS"
        onClose={() => setShortcutsOpen(false)}
      >
        <div className="shortcuts-grid">
          <div className="shortcut-row">
            <span className="shortcut-label">Navigate</span>
            <span>
              <span className="keyboard-key">↑</span>
              <span className="keyboard-key">↓</span>
              <span className="keyboard-key">←</span>
              <span className="keyboard-key">→</span>
            </span>
          </div>

          <div className="shortcut-row">
            <span className="shortcut-label">Select</span>
            <span className="keyboard-key">ENTER</span>
          </div>

          <div className="shortcut-row">
            <span className="shortcut-label">Back</span>
            <span className="keyboard-key">ESC</span>
          </div>

          <div className="shortcut-row">
            <span className="shortcut-label">Add Note</span>
            <span className="keyboard-key">N</span>
          </div>

          <div className="shortcut-row">
            <span className="shortcut-label">Library</span>
            <span className="keyboard-key">L</span>
          </div>

          <div className="shortcut-row">
            <span className="shortcut-label">Theme</span>
            <span className="keyboard-key">T</span>
          </div>

          <div className="shortcut-row">
            <span className="shortcut-label">Shortcuts</span>
            <span className="keyboard-key">?</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;