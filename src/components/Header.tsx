import React from 'react';
import type { Document, Annotation, ThemeMode, ActiveView } from '../types';
import { Kbd } from './Kbd';
import { BookOpen, CheckSquare, Search, Maximize2, Minimize2, Keyboard, Library, Command, ChevronDown, Sun, Moon, Layers, Bookmark, MessageSquare, HelpCircle, Highlighter } from 'lucide-react';

interface HeaderProps {
  document: Document; activeView: ActiveView; progressPercent: number; theme: ThemeMode; zenMode: boolean;
  onViewChange: (view: ActiveView) => void; onOpenSearch: () => void; onOpenCommandPalette: () => void;
  onToggleTheme: () => void; onToggleZen: () => void; onOpenShortcuts: () => void; onOpenLibrary: () => void;
  isHeaderFocused?: boolean; focusedHeaderTarget?: 'read' | 'review' | 'library' | 'search' | 'theme' | 'zen' | 'shortcuts';
}

export const Header: React.FC<HeaderProps> = ({
  document, activeView, progressPercent, theme, zenMode, onViewChange, onOpenSearch,
  onOpenCommandPalette, onToggleTheme, onToggleZen, onOpenShortcuts, onOpenLibrary,
  isHeaderFocused = false, focusedHeaderTarget = 'read'
}) => {
  const isSel = (t: string) => isHeaderFocused && focusedHeaderTarget === t;
  return (
    <header className={`app-header ${zenMode ? 'zen-header' : ''}`}>
      <div className="header-top-row">
        <div className="header-left">
          <div className="brand-logo" onClick={() => onViewChange('read')} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onViewChange('read')}>
            <span className="brand-pixel-box">N</span><span className="brand-text">NOTEBOOK</span>
          </div>
          <div className="header-doc-picker" onClick={onOpenLibrary} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpenLibrary()} title="Switch Document (Press 3)">
            <span className="current-doc-name">{document.title}</span><ChevronDown size={14} className="doc-picker-arrow" />
          </div>
        </div>
        <nav className="header-nav-modes" aria-label="Main Navigation">
          <button type="button" className={`nav-mode-btn ${activeView === 'read' ? 'active' : ''} ${isSel('read') ? 'is-arrow-selected' : ''}`} onClick={() => onViewChange('read')}>
            <BookOpen size={14} /><span>Read</span><Kbd size="sm">1</Kbd>{isSel('read') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`nav-mode-btn ${activeView === 'review' ? 'active' : ''} ${isSel('review') ? 'is-arrow-selected' : ''}`} onClick={() => onViewChange('review')}>
            <CheckSquare size={14} /><span>Review</span><Kbd size="sm">2</Kbd>{isSel('review') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`nav-mode-btn ${activeView === 'library' ? 'active' : ''} ${isSel('library') ? 'is-arrow-selected' : ''}`} onClick={onOpenLibrary}>
            <Library size={14} /><span>Library</span><Kbd size="sm">3</Kbd>{isSel('library') && <span className="mc-arrow-cursor">◄</span>}
          </button>
        </nav>
        <div className="header-right-tools">
          <button type="button" className={`tool-btn search-trigger-btn ${isSel('search') ? 'is-arrow-selected' : ''}`} onClick={onOpenSearch} title="Search Document (/)">
            <Search size={14} /><span className="btn-label-desktop">Search</span><Kbd size="sm">/</Kbd>{isSel('search') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className="tool-btn command-trigger-btn" onClick={onOpenCommandPalette} title="Command Palette (Ctrl+K)">
            <Command size={13} /><Kbd size="sm">K</Kbd>
          </button>
          <button type="button" className={`tool-btn theme-btn ${isSel('theme') ? 'is-arrow-selected' : ''}`} onClick={onToggleTheme} title={`Mode: ${theme === 'light' ? 'Day' : 'Night'} (T)`}>
            {theme === 'light' ? <Sun size={14} className="text-amber" /> : <Moon size={14} className="text-cyan" />}
            <span className="btn-label-desktop">{theme === 'light' ? 'Day' : 'Night'}</span><Kbd size="sm">T</Kbd>{isSel('theme') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`tool-btn zen-btn ${isSel('zen') ? 'is-arrow-selected' : ''}`} onClick={onToggleZen} title={zenMode ? 'Exit Zen Mode (F)' : 'Zen Focus Mode (F)'}>
            {zenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{isSel('zen') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`tool-btn help-btn ${isSel('shortcuts') ? 'is-arrow-selected' : ''}`} onClick={onOpenShortcuts} title="Keyboard Function (?)" aria-label="Keyboard guide">
            <Keyboard size={14} /><Kbd size="sm">?</Kbd>{isSel('shortcuts') && <span className="mc-arrow-cursor">◄</span>}
          </button>
        </div>
      </div>
      <div className="header-progress-container" title={`Reading Progress: ${progressPercent}%`}>
        <div className="header-progress-bar" style={{ width: `${Math.max(2, progressPercent)}%` }} />
      </div>
    </header>
  );
};

interface SidebarProps {
  document: Document; activeSectionId: string; annotations: Annotation[];
  onSelectSection: (sectionId: string) => void; onOpenNewDoc: () => void;
  isSidebarFocused?: boolean; selectedSidebarIndex?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  document, activeSectionId, annotations, onSelectSection, onOpenNewDoc, isSidebarFocused = false, selectedSidebarIndex = 0
}) => {
  const docAnns = annotations.filter((a) => a.docId === document.id);
  const isAddSelected = isSidebarFocused && (selectedSidebarIndex === -1 || selectedSidebarIndex === document.sections.length);
  return (
    <aside className="app-sidebar" aria-label="Table of Contents">
      <div className="sidebar-doc-meta">
        <div className="sidebar-meta-top">
          <span className="sidebar-category-pill">{document.category}</span>
          <span className="sidebar-time-pill">{document.readTimeMinutes}m read</span>
        </div>
        <h2 className="sidebar-title">{document.title}</h2>
        <p className="sidebar-author">By {document.author}</p>
      </div>
      <div className="sidebar-section-header">
        <div className="sidebar-section-title-wrap"><Layers size={14} className="text-muted" /><span>Table of Contents</span></div>
        <div className="sidebar-nav-hint"><Kbd size="sm">J</Kbd><Kbd size="sm">K</Kbd></div>
      </div>
      <nav className="sidebar-sections-list">
        {document.sections.length === 0 ? (
          <div className="sidebar-empty-state" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', color: 'var(--mc-text-dim)', fontSize: '0.72rem' }}>
            No chapters yet. Press <Kbd size="sm">N</Kbd> to add a reading.
          </div>
        ) : document.sections.map((section, idx) => {
          const secAnns = docAnns.filter((a) => a.sectionId === section.id);
          const isSel = isSidebarFocused && selectedSidebarIndex === idx;
          return (
            <button key={section.id} type="button" className={`sidebar-section-item ${section.id === activeSectionId ? 'active' : ''} ${isSel ? 'is-arrow-selected' : ''}`} onClick={() => onSelectSection(section.id)}>
              <div className="section-item-left">
                <span className="section-index-num">{String(idx + 1).padStart(2, '0')}</span>
                <span className="section-item-title">{section.title}</span>
              </div>
              <div className="section-item-badges">
                {secAnns.some((a) => a.type === 'bookmark') && <Bookmark size={12} className="text-rose fill-rose" />}
                {secAnns.some((a) => a.type === 'highlight') && <Highlighter size={12} className="text-emerald" />}
                {secAnns.some((a) => a.type === 'question') && <HelpCircle size={12} className="text-cyan" />}
                {secAnns.some((a) => a.type === 'note') && <MessageSquare size={12} className="text-amber" />}
                {secAnns.length > 0 && <span className="section-total-count">{secAnns.length}</span>}
                {isSel && <span className="mc-arrow-cursor">◄</span>}
              </div>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button type="button" className={`sidebar-add-doc-btn ${isAddSelected ? 'is-arrow-selected' : ''}`} onClick={onOpenNewDoc}>
          <span>+ New Reading Material</span>{isAddSelected && <span className="mc-arrow-cursor">◄</span>}
        </button>
      </div>
    </aside>
  );
};
