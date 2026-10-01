import React, { useState, useEffect, useCallback } from 'react';
import type { Document, Annotation, AnnotationType, ActiveView, UserPrefs, ThemeMode } from './types';
import { loadDocuments, saveDocuments, loadActiveDocId, saveActiveDocId, loadAnnotations, saveAnnotations, loadUserPrefs, saveUserPrefs } from './utils/storage';
import { Header, Sidebar } from './components/Header';
import { ReadingView } from './components/ReadingView';
import { MarginThinkingSpace } from './components/MarginThinkingSpace';
import { ReviewMode } from './components/ReviewMode';
import { ShortcutsModal, AnnotationPromptModal, AboutModal, SearchModal, CommandPalette } from './components/Modals';
import { NewDocModal } from './components/NewDocModal';
import { LibraryModal } from './components/LibraryModal';
import { HomeHero } from './components/HomeHero';

const HEADER_TARGETS: Array<'read' | 'review' | 'library' | 'search' | 'theme' | 'zen' | 'shortcuts'> = ['read', 'review', 'library', 'search', 'theme', 'zen', 'shortcuts'];
const MARGIN_CHIPS: Array<'note' | 'mark' | 'ask' | 'save'> = ['note', 'mark', 'ask', 'save'];
const EMPTY_DOC: Document = { id: 'empty', title: 'Empty Workspace', author: 'None', category: 'General', readTimeMinutes: 0, sections: [], lastReadSectionId: '', createdAt: '' };

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(() => loadDocuments());
  const [activeDocId, setActiveDocId] = useState<string>(() => loadActiveDocId(documents[0]?.id || ''));
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadAnnotations());
  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() => loadUserPrefs());
  const currentDoc = documents.find((d) => d.id === activeDocId) || documents[0] || EMPTY_DOC;

  const [activeSectionId, setActiveSectionId] = useState<string>(currentDoc.lastReadSectionId || currentDoc.sections[0]?.id || '');
  const [activeParaIndex, setActiveParaIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [promptState, setPromptState] = useState<{ isOpen: boolean; type: 'note' | 'question'; quote: string }>({ isOpen: false, type: 'note', quote: '' });

  const [workspaceZone, setWorkspaceZone] = useState<'content' | 'sidebar' | 'margin' | 'header'>('content');
  const [emptyTarget, setEmptyTarget] = useState<'addDoc' | 'library'>('addDoc');
  const [headerTarget, setHeaderTarget] = useState<typeof HEADER_TARGETS[number]>('read');
  const [selectedSidebarIndex, setSelectedSidebarIndex] = useState<number>(0);
  const [selectedMarginTarget, setSelectedMarginTarget] = useState<typeof MARGIN_CHIPS[number]>('note');

  const activeSectionIndex = currentDoc.sections.findIndex((s) => s.id === activeSectionId);
  const currentSection = currentDoc.sections[activeSectionIndex] || currentDoc.sections[0] || { id: 'sec-1', title: 'Section', content: '', paragraphs: [] };
  const currentParaText = currentSection.paragraphs[activeParaIndex] || currentSection.paragraphs[0] || '';

  useEffect(() => { saveDocuments(documents); }, [documents]);
  useEffect(() => {
    saveActiveDocId(activeDocId);
    const doc = documents.find((d) => d.id === activeDocId);
    if (doc?.sections.length) { setActiveSectionId(doc.lastReadSectionId || doc.sections[0].id); setActiveParaIndex(0); }
  }, [activeDocId, documents]);
  useEffect(() => { saveAnnotations(annotations); }, [annotations]);
  useEffect(() => { saveUserPrefs(userPrefs); document.documentElement.setAttribute('data-theme', userPrefs.theme); }, [userPrefs]);

  const showToast = (msg: string) => { setLastActionToast(msg); setTimeout(() => setLastActionToast((p) => (p === msg ? null : p)), 2200); };
  const handleSelectSection = (secId: string, paraIdx = 0) => {
    setActiveSectionId(secId);
    setActiveParaIndex(paraIdx);
    setDocuments((prev) => prev.map((d) => (d.id === currentDoc.id ? { ...d, lastReadSectionId: secId } : d)));
  };

  const handleAddAnnotation = (type: AnnotationType, content?: string, quote?: string) => {
    const sel = window.getSelection()?.toString().trim();
    const finalQuote = quote || (sel && sel.length > 1 ? sel : currentParaText || undefined);
    if (type === 'highlight' || type === 'bookmark') {
      const ex = annotations.find((a) => a.docId === currentDoc.id && a.sectionId === activeSectionId && a.type === type && (type === 'bookmark' || a.quote === finalQuote));
      if (ex) { setAnnotations((p) => p.filter((a) => a.id !== ex.id)); showToast(type === 'highlight' ? `Removed highlight on Para ${activeParaIndex + 1} [M]` : 'Removed bookmark [B]'); return; }
    }
    const newAnn: Annotation = { id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, docId: currentDoc.id, sectionId: activeSectionId, type, quote: finalQuote, content, resolved: false, createdAt: new Date().toISOString() };
    setAnnotations((p) => [newAnn, ...p]);
    showToast({ note: `Note added to Para ${activeParaIndex + 1} [N]`, highlight: `Highlighted Para ${activeParaIndex + 1} [M]`, question: `Question added to Para ${activeParaIndex + 1} [Q]`, bookmark: 'Bookmark saved [B]' }[type]);
  };

  const handleDeleteAnnotation = (id: string) => { setAnnotations((p) => p.filter((a) => a.id !== id)); showToast('Deleted annotation'); };
  const handleToggleResolveQuestion = (id: string) => setAnnotations((p) => p.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a)));
  const handleCycleTheme = () => { const next: ThemeMode = userPrefs.theme === 'light' ? 'dark' : 'light'; setUserPrefs((p) => ({ ...p, theme: next })); showToast(`Minecraft Mode: ${next === 'light' ? '☀️ DAY (LIGHT)' : '🌙 NIGHT (DARK)'} [T]`); };
  const handleToggleZen = () => setUserPrefs((p) => { const n = !p.zenMode; showToast(n ? 'Zen Focus Mode ON [F]' : 'Zen Focus Mode OFF [F]'); return { ...p, zenMode: n }; });
  const handleTriggerPrompt = (type: 'note' | 'question') => {
    const s = window.getSelection()?.toString().trim();
    setPromptState({ isOpen: true, type, quote: s && s.length > 1 ? s : currentParaText });
  };
  const handleExportDoc = () => { navigator.clipboard.writeText(`# ${currentDoc.title}\nBy ${currentDoc.author}\n\n` + currentDoc.sections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n')); showToast('Copied document markdown to clipboard'); };

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setIsPaletteOpen((p) => !p); return; }
    if (e.key === 'Escape') {
      if (isAboutOpen) return setIsAboutOpen(false);
      if (promptState.isOpen) return setPromptState((p) => ({ ...p, isOpen: false }));
      if (isSearchOpen) return setIsSearchOpen(false);
      if (isPaletteOpen) return setIsPaletteOpen(false);
      if (isShortcutsOpen) return setIsShortcutsOpen(false);
      if (isNewDocOpen) return setIsNewDocOpen(false);
      if (isLibraryOpen) return setIsLibraryOpen(false);
      if (activeView === 'review') { setActiveView('read'); showToast('Back to Reading [Esc]'); return; }
      if (activeView === 'read') { setActiveView('home'); showToast('Returned to Home [Esc]'); return; }
    }
    if (tag === 'input' || tag === 'textarea') return;
    const key = e.key.toLowerCase();
    if (isAboutOpen && key === 'a') { e.preventDefault(); setIsAboutOpen(false); return; }
    if (isShortcutsOpen && (e.key === '?' || key === 'h')) { e.preventDefault(); setIsShortcutsOpen(false); return; }
    if (promptState.isOpen || isSearchOpen || isPaletteOpen || isShortcutsOpen || isNewDocOpen || isLibraryOpen || isAboutOpen) return;

    if (activeView === 'home') {
      if (e.key === 'Enter' || key === 'e') { e.preventDefault(); setActiveView('read'); showToast('Started Reading [E]'); }
      else if (key === 'a') { e.preventDefault(); setIsAboutOpen(true); }
      else if (key === 'n') { e.preventDefault(); setIsNewDocOpen(true); }
      else if (key === 'l' || key === '3') { e.preventDefault(); setIsLibraryOpen(true); }
      else if (key === '?' || key === 'h') { e.preventDefault(); setIsShortcutsOpen(true); }
      else if (key === 't') { e.preventDefault(); handleCycleTheme(); }
      return;
    }

    const secs = currentDoc.sections, curIdx = secs.findIndex((s) => s.id === activeSectionId);
    const paraCount = currentSection.paragraphs.length;
    if (e.key === 'Enter' && (workspaceZone !== 'content' || !secs.length)) {
      e.preventDefault();
      if (workspaceZone === 'header') {
        ({ read: () => setActiveView('read'), review: () => setActiveView('review'), library: () => setIsLibraryOpen(true), search: () => setIsSearchOpen(true), theme: handleCycleTheme, zen: handleToggleZen, shortcuts: () => setIsShortcutsOpen(true) }[headerTarget])();
      } else if (workspaceZone === 'content' && !secs.length) {
        emptyTarget === 'addDoc' ? setIsNewDocOpen(true) : setIsLibraryOpen(true);
      } else if (workspaceZone === 'sidebar') {
        if (selectedSidebarIndex >= 0 && selectedSidebarIndex < secs.length) { handleSelectSection(secs[selectedSidebarIndex].id, 0); setWorkspaceZone('content'); showToast(`Selected Chapter: ${secs[selectedSidebarIndex].title}`); }
        else setIsNewDocOpen(true);
      } else if (workspaceZone === 'margin') {
        ({ note: () => handleTriggerPrompt('note'), mark: () => handleAddAnnotation('highlight'), ask: () => handleTriggerPrompt('question'), save: () => handleAddAnnotation('bookmark') }[selectedMarginTarget])();
      }
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (workspaceZone === 'header') setHeaderTarget(HEADER_TARGETS[(HEADER_TARGETS.indexOf(headerTarget) + dir + HEADER_TARGETS.length) % HEADER_TARGETS.length]);
      else if (dir === -1 && workspaceZone === 'margin') { setWorkspaceZone('content'); showToast('Reading Canvas [←]'); }
      else if (dir === -1 && workspaceZone === 'content') { setWorkspaceZone('sidebar'); showToast('Table of Contents [←]'); }
      else if (dir === 1 && workspaceZone === 'sidebar') { setWorkspaceZone('content'); showToast('Reading Canvas [→]'); }
      else if (dir === 1 && workspaceZone === 'content') { setWorkspaceZone('margin'); showToast('Thinking Margin [→]'); }
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const down = e.key === 'ArrowDown';
      if (down && workspaceZone === 'header') { setWorkspaceZone('content'); showToast('Reading Canvas [↓]'); }
      else if (workspaceZone === 'content') {
        if (!secs.length) {
          if (down) setEmptyTarget((p) => (p === 'addDoc' ? 'library' : 'addDoc'));
          else if (emptyTarget === 'library') setEmptyTarget('addDoc');
          else { setWorkspaceZone('header'); setHeaderTarget('read'); showToast('Top Header [↑]'); }
        } else if (down) {
          if (activeParaIndex < paraCount - 1) {
            setActiveParaIndex((p) => p + 1);
            showToast(`Paragraph ${activeParaIndex + 2}/${paraCount} [↓]`);
          } else if (curIdx < secs.length - 1) {
            handleSelectSection(secs[curIdx + 1].id, 0);
            setSelectedSidebarIndex(curIdx + 1);
            showToast(`Section ${curIdx + 2}: Para 1 [↓]`);
          }
        } else {
          if (activeParaIndex > 0) {
            setActiveParaIndex((p) => p - 1);
            showToast(`Paragraph ${activeParaIndex}/${paraCount} [↑]`);
          } else if (curIdx > 0) {
            const prevSec = secs[curIdx - 1];
            handleSelectSection(prevSec.id, Math.max(0, prevSec.paragraphs.length - 1));
            setSelectedSidebarIndex(curIdx - 1);
            showToast(`Section ${curIdx}: Para ${prevSec.paragraphs.length} [↑]`);
          } else {
            setWorkspaceZone('header'); setHeaderTarget('read'); showToast('Top Header [↑]');
          }
        }
      } else if (workspaceZone === 'sidebar') {
        setSelectedSidebarIndex((p) => down ? (p >= secs.length ? 0 : p + 1) : (p <= 0 ? secs.length : p - 1));
      } else if (workspaceZone === 'margin') {
        const idx = MARGIN_CHIPS.indexOf(selectedMarginTarget);
        if (!down && idx === 0) { setWorkspaceZone('header'); setHeaderTarget('shortcuts'); showToast('Top Header [↑]'); }
        else setSelectedMarginTarget(MARGIN_CHIPS[(idx + (down ? 1 : -1) + MARGIN_CHIPS.length) % MARGIN_CHIPS.length]);
      }
      return;
    }

    if (key === 'j' && curIdx < secs.length - 1) { e.preventDefault(); handleSelectSection(secs[curIdx + 1].id, 0); setSelectedSidebarIndex(curIdx + 1); showToast(`Section ${curIdx + 2}/${secs.length} [J]`); }
    else if (key === 'k' && curIdx > 0) { e.preventDefault(); handleSelectSection(secs[curIdx - 1].id, 0); setSelectedSidebarIndex(curIdx - 1); showToast(`Section ${curIdx}/${secs.length} [K]`); }
    else if (key === 'n') { e.preventDefault(); handleTriggerPrompt('note'); }
    else if (key === 'm') { e.preventDefault(); handleAddAnnotation('highlight'); }
    else if (key === 'q') { e.preventDefault(); handleTriggerPrompt('question'); }
    else if (key === 'b') { e.preventDefault(); handleAddAnnotation('bookmark'); }
    else if (key === 'r') { e.preventDefault(); setActiveView((p) => { const n = p === 'review' ? 'read' : 'review'; showToast(n === 'review' ? 'Review Mode [R]' : 'Reading Mode [R]'); return n; }); }
    else if (e.key === '/') { e.preventDefault(); setIsSearchOpen(true); }
    else if (key === 'f') { e.preventDefault(); handleToggleZen(); }
    else if (key === 't') { e.preventDefault(); handleCycleTheme(); }
    else if (e.key === '?' || key === 'h') { e.preventDefault(); setIsShortcutsOpen(true); }
    else if (key === '1') { e.preventDefault(); setActiveView('read'); }
    else if (key === '2') { e.preventDefault(); setActiveView('review'); }
    else if (key === '3') { e.preventDefault(); setIsLibraryOpen(true); }
  }, [activeSectionId, activeParaIndex, currentDoc, currentSection, currentParaText, activeView, workspaceZone, emptyTarget, headerTarget, selectedSidebarIndex, selectedMarginTarget, promptState.isOpen, isSearchOpen, isPaletteOpen, isShortcutsOpen, isNewDocOpen, isLibraryOpen, isAboutOpen, userPrefs.theme]);

  useEffect(() => { window.addEventListener('keydown', handleGlobalKeyDown); return () => window.removeEventListener('keydown', handleGlobalKeyDown); }, [handleGlobalKeyDown]);

  const progressPercent = Math.round(((Math.max(0, activeSectionIndex) + 1) / Math.max(1, currentDoc.sections.length)) * 100);

  return (
    <div className={`margin-app-root theme-${userPrefs.theme} ${userPrefs.zenMode ? 'is-zen' : ''}`}>
      {activeView !== 'home' && (
        <Header document={currentDoc} activeView={activeView} progressPercent={progressPercent} theme={userPrefs.theme} zenMode={userPrefs.zenMode}
          onViewChange={(v) => (v === 'library' ? setIsLibraryOpen(true) : setActiveView(v))} onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCommandPalette={() => setIsPaletteOpen(true)} onToggleTheme={handleCycleTheme} onToggleZen={handleToggleZen}
          onOpenShortcuts={() => setIsShortcutsOpen(true)} onOpenLibrary={() => setIsLibraryOpen(true)}
          isHeaderFocused={workspaceZone === 'header'} focusedHeaderTarget={headerTarget} />
      )}
      <div className="app-workspace-body">
        {activeView === 'home' ? (
          <HomeHero theme={userPrefs.theme} onToggleTheme={handleCycleTheme} onStartReading={() => setActiveView('read')}
            onOpenNewDoc={() => setIsNewDocOpen(true)} onOpenLibrary={() => setIsLibraryOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen((p) => !p)} onOpenAbout={() => setIsAboutOpen((p) => !p)} />
        ) : activeView === 'review' ? (
          <ReviewMode document={currentDoc} annotations={annotations} onSelectSection={(secId) => { handleSelectSection(secId, 0); setActiveView('read'); }}
            onReturnToReading={() => setActiveView('read')} onToggleResolveQuestion={handleToggleResolveQuestion} onDeleteAnnotation={handleDeleteAnnotation} />
        ) : (
          <div className="reading-layout-grid">
            {!userPrefs.zenMode && (
              <Sidebar document={currentDoc} activeSectionId={activeSectionId} annotations={annotations} onSelectSection={(id) => handleSelectSection(id, 0)}
                onOpenNewDoc={() => setIsNewDocOpen(true)} isSidebarFocused={workspaceZone === 'sidebar'} selectedSidebarIndex={selectedSidebarIndex} />
            )}
            <ReadingView sections={currentDoc.sections} activeSectionId={activeSectionId} activeParaIndex={activeParaIndex}
              annotations={annotations.filter((a) => a.docId === currentDoc.id)}
              fontFamily={userPrefs.fontFamily} fontSize={userPrefs.fontSize} lastActionToast={lastActionToast}
              onSelectSection={handleSelectSection} onQuickAnnotate={(t) => handleAddAnnotation(t)}
              onTriggerPrompt={handleTriggerPrompt} onOpenNewDoc={() => setIsNewDocOpen(true)}
              onOpenLibrary={() => setIsLibraryOpen(true)} emptyTarget={emptyTarget} isReadingFocused={workspaceZone === 'content'} />
            {!userPrefs.zenMode && (
              <MarginThinkingSpace section={currentSection} documentId={currentDoc.id} annotations={annotations} showAll={userPrefs.showAllMarginAnnotations}
                onToggleShowAll={() => setUserPrefs((p) => ({ ...p, showAllMarginAnnotations: !p.showAllMarginAnnotations }))} onAddAnnotation={handleAddAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation} onToggleResolveQuestion={handleToggleResolveQuestion} onJumpToSection={(id) => handleSelectSection(id, 0)}
                onTriggerPrompt={handleTriggerPrompt} isMarginFocused={workspaceZone === 'margin'} selectedMarginTarget={selectedMarginTarget} />
            )}
          </div>
        )}
      </div>
      <SearchModal isOpen={isSearchOpen} document={currentDoc} onSelectMatch={(secId) => { handleSelectSection(secId, 0); setActiveView('read'); }} onClose={() => setIsSearchOpen(false)} />
      <CommandPalette isOpen={isPaletteOpen} document={currentDoc} allDocuments={documents} currentTheme={userPrefs.theme} zenMode={userPrefs.zenMode}
        onSelectDocument={(id) => { setActiveDocId(id); setActiveView('read'); }} onSelectSection={(secId) => { handleSelectSection(secId, 0); setActiveView('read'); }}
        onTriggerAnnotation={(t) => (t === 'note' || t === 'question' ? handleTriggerPrompt(t) : handleAddAnnotation(t))}
        onToggleReview={() => setActiveView((p) => (p === 'review' ? 'read' : 'review'))} onToggleTheme={handleCycleTheme} onToggleZen={handleToggleZen}
        onOpenShortcuts={() => setIsShortcutsOpen(true)} onOpenNewDoc={() => setIsNewDocOpen(true)} onExportDoc={handleExportDoc} onClose={() => setIsPaletteOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <NewDocModal isOpen={isNewDocOpen}
        onSave={(newDoc) => { setDocuments((p) => [newDoc, ...p]); setActiveDocId(newDoc.id); setActiveView('read'); showToast(`Started "${newDoc.title}"`); }}
        onSelectSample={(s) => { if (!documents.some((d) => d.id === s.id)) setDocuments((p) => [s, ...p]); setActiveDocId(s.id); setActiveView('read'); showToast(`Loaded "${s.title}"`); }}
        onClose={() => setIsNewDocOpen(false)} />
      <LibraryModal isOpen={isLibraryOpen} documents={documents} activeDocId={activeDocId} annotations={annotations}
        onSelectDoc={(id) => { setActiveDocId(id); setActiveView('read'); }}
        onDeleteDoc={(id) => {
          setDocuments((p) => p.filter((d) => d.id !== id));
          if (activeDocId === id) { const rem = documents.filter((d) => d.id !== id); if (rem.length) setActiveDocId(rem[0].id); }
          showToast('Document deleted');
        }}
        onOpenNewDoc={() => setIsNewDocOpen(true)} onClose={() => setIsLibraryOpen(false)} />
      <AnnotationPromptModal isOpen={promptState.isOpen} type={promptState.type} selectedQuote={promptState.quote} sectionTitle={`${currentSection.title} • Para ${activeParaIndex + 1}`}
        onSave={(c) => handleAddAnnotation(promptState.type, c, promptState.quote || undefined)} onClose={() => setPromptState((p) => ({ ...p, isOpen: false }))} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} onStartReading={() => { setIsAboutOpen(false); setActiveView('read'); }} />
    </div>
  );
};

export default App;
