import React, { useState, useEffect, useRef } from 'react';
import {
  X, BookOpen, Keyboard, ShieldCheck, Sparkles, Pin, HelpCircle, MessageSquare,
  Search, CornerDownLeft, ArrowDown, ArrowUp, CheckSquare, PlusCircle, Bookmark,
  Highlighter, SunMoon, Maximize2, FileText, Download, List
} from 'lucide-react';
import { Kbd } from './Kbd';
import type { AnnotationType, Document, SearchMatch, ThemeMode } from '../types';

export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void; onStartReading: () => void }> = ({ isOpen, onClose, onStartReading }) => {
  const [selectedBtn, setSelectedBtn] = useState<'close' | 'start'>('start');

  useEffect(() => {
    if (isOpen) setSelectedBtn('start');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); e.stopPropagation();
        setSelectedBtn((p) => (p === 'start' ? 'close' : 'start'));
      } else if (e.key === 'Enter') {
        e.preventDefault(); e.stopPropagation();
        onClose();
        if (selectedBtn === 'start') onStartReading();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isOpen, selectedBtn, onClose, onStartReading]);
  if (!isOpen) return null;

  return (
    <div className="mc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mc-about-simple-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mc-about-header">
          <div className="mc-about-header-title"><BookOpen size={16} className="mc-about-book-icon" /><span>ABOUT NOTEBOOK</span></div>
          <button type="button" className="mc-about-close-btn" onClick={onClose} title="Close [Esc]"><X size={15} /></button>
        </div>
        <div className="mc-about-body">
          <div className="mc-about-hero">
            <div className="mc-about-logo-badge"><span className="mc-about-logo-text">NOTEBOOK</span><span className="mc-about-version">v1.0</span></div>
            <p className="mc-about-tagline">A distraction-free reading workspace designed for deep comprehension, keyboard flow, and margin reflection.</p>
          </div>
          <div className="mc-about-features">
            <div className="mc-about-feature-card">
              <div className="mc-about-feature-head"><Keyboard size={15} className="mc-feature-icon" /><span className="mc-feature-name">KEYBOARD FIRST</span></div>
              <p className="mc-feature-desc">Navigate lines, jump sections, and open tools without touching your mouse or trackpad. Keep your hands on the home row.</p>
            </div>
            <div className="mc-about-feature-card">
              <div className="mc-about-feature-head"><Pin size={15} className="mc-feature-icon" /><span className="mc-feature-name">MARGIN THINKING</span></div>
              <p className="mc-feature-desc">Capture thoughts as you read. Anchor notes with <strong>[N]</strong>, ask questions with <strong>[Q]</strong>, and highlight with <strong>[M]</strong> directly alongside the text.</p>
            </div>
            <div className="mc-about-feature-card">
              <div className="mc-about-feature-head"><Sparkles size={15} className="mc-feature-icon" /><span className="mc-feature-name">SPACED RETRIEVAL</span></div>
              <p className="mc-feature-desc">Switch to Review Mode with <strong>[R]</strong> to test yourself on highlighted insights and solidify long-term memory.</p>
            </div>
            <div className="mc-about-feature-card">
              <div className="mc-about-feature-head"><ShieldCheck size={15} className="mc-feature-icon" /><span className="mc-feature-name">LOCAL & PRIVATE</span></div>
              <p className="mc-feature-desc">All your documents, notes, and reading progress are stored locally on your device. Zero tracking, zero clutter.</p>
            </div>
          </div>
          <div className="mc-about-quick-keys">
            <span className="mc-quick-keys-label">QUICK CONTROLS:</span>
            <div className="mc-quick-keys-list">
              <span className="mc-key-chip"><kbd>↑ ↓</kbd> Scroll</span><span className="mc-key-chip"><kbd>J / K</kbd> Sections</span>
              <span className="mc-key-chip"><kbd>N</kbd> Note</span><span className="mc-key-chip"><kbd>Q</kbd> Question</span>
              <span className="mc-key-chip"><kbd>F</kbd> Focus</span><span className="mc-key-chip"><kbd>?</kbd> All Keys</span>
            </div>
          </div>
        </div>
        <div className="mc-about-footer">
          <span className="mc-about-footer-hint">[← →] SELECT • [ESC] CLOSE • [ENTER] CONFIRM</span>
          <div className="mc-about-actions">
            <button type="button" className={`mc-about-btn btn-stone ${selectedBtn === 'close' ? 'is-arrow-selected' : ''}`} onClick={onClose} onMouseEnter={() => setSelectedBtn('close')}>
              ESC CLOSE {selectedBtn === 'close' && <span className="mc-arrow-cursor">◄</span>}
            </button>
            <button type="button" className={`mc-about-btn btn-green ${selectedBtn === 'start' ? 'is-arrow-selected' : ''}`} onClick={() => { onClose(); onStartReading(); }} onMouseEnter={() => setSelectedBtn('start')}>
              START READING ↵ {selectedBtn === 'start' && <span className="mc-arrow-cursor">◄</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KEYBOARD_SHORTCUTS = [
  { key: '↑ ↓ ← →', action: 'Navigate Every Page & Modal' }, { key: 'ENTER', action: 'Open / Select' },
  { key: 'ESC', action: 'Back / Close' }, { key: 'A', action: 'About NOTEBOOK' },
  { key: 'N', action: 'New Note / New Doc' }, { key: 'L', action: 'Reading Library' },
  { key: 'M', action: 'Mark Highlight' }, { key: 'Q', action: 'Ask Question' },
  { key: 'B', action: 'Bookmark Section' }, { key: 'R', action: 'Review Mode' },
  { key: '/', action: 'Search / Command Palette' }, { key: 'J / K', action: 'Next / Prev Section' },
  { key: 'F', action: 'Zen Focus Mode' }, { key: 'T', action: 'Cycle Day / Night Mode' },
];

export const ShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedRowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { selectedRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [selectedIdx]);
  useEffect(() => { if (isOpen) { setSelectedIdx(0); if (listRef.current) listRef.current.scrollTop = 0; } }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const len = KEYBOARD_SHORTCUTS.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((p) => (p + 1) % len); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((p) => (p - 1 + len) % len); }
      else if (e.key === 'PageDown') { e.preventDefault(); setSelectedIdx((p) => Math.min(len - 1, p + 4)); }
      else if (e.key === 'PageUp') { e.preventDefault(); setSelectedIdx((p) => Math.max(0, p - 4)); }
      else if (e.key === 'Home') { e.preventDefault(); setSelectedIdx(0); }
      else if (e.key === 'End') { e.preventDefault(); setSelectedIdx(len - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  return (
    <div className="mc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mc-keyboard-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mc-keyboard-header">
          <h2 className="mc-keyboard-title">KEYBOARD CONTROLS</h2><span className="mc-keyboard-subtitle">[↑ ↓ ← →] TO SCROLL</span>
        </div>
        <div className="mc-keyboard-list" ref={listRef}>
          {KEYBOARD_SHORTCUTS.map((item, idx) => (
            <div key={item.key} ref={idx === selectedIdx ? selectedRowRef : null}
              className={`mc-keyboard-row ${idx === selectedIdx ? 'is-arrow-selected' : ''}`}>
              <span className="mc-keycap">{item.key}</span><span className="mc-key-action">{item.action}</span>
              {idx === selectedIdx && <span className="mc-arrow-cursor-sm">◄</span>}
            </div>
          ))}
        </div>
        <div className="mc-keyboard-footer">
          <span className="mc-footer-hint">[↑ ↓ ← →] MOVE • [ENTER / ESC] CLOSE</span>
          <button type="button" className="mc-esc-close-btn" onClick={onClose}>ESC CLOSE</button>
        </div>
      </div>
    </div>
  );
};

export const AnnotationPromptModal: React.FC<{ isOpen: boolean; type: AnnotationType; selectedQuote: string; sectionTitle: string; onSave: (content: string) => void; onClose: () => void }> = ({
  isOpen, type, selectedQuote, sectionTitle, onSave, onClose
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (isOpen) { setContent(''); setTimeout(() => textareaRef.current?.focus(), 50); } }, [isOpen]);
  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => { e?.preventDefault(); if (!content.trim() && type !== 'highlight' && type !== 'bookmark') return; onSave(content.trim()); onClose(); };
  const isQuestion = type === 'question';

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window prompt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prompt-header">
          <div className="prompt-type-badge">
            {isQuestion ? <><HelpCircle size={16} className="text-cyan" /><span className="text-cyan">Attach Question</span></>
              : <><MessageSquare size={16} className="text-amber" /><span className="text-amber">Attach Note</span></>}
          </div>
          <span className="prompt-section-tag">{sectionTitle}</span>
          <button type="button" className="icon-btn close-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        {selectedQuote && <div className="prompt-quote-box"><span className="quote-marker">"</span><p className="quote-text">{selectedQuote}</p></div>}
        <form onSubmit={handleSubmit}>
          <textarea ref={textareaRef} className="prompt-textarea" rows={3} value={content} onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); handleSubmit(); } }}
            placeholder={isQuestion ? 'Type your question for this paragraph... (Press Enter to save)' : 'Type your note for this paragraph... (Press Enter to save)'} />
          <div className="prompt-actions">
            <span className="prompt-hint"><Kbd size="sm">Enter</Kbd> to save • <Kbd size="sm">Shift+Enter</Kbd> new line • <Kbd size="sm">Esc</Kbd> cancel</span>
            <div className="prompt-btn-group">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save to Margin</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SearchModal: React.FC<{ isOpen: boolean; document: Document; onSelectMatch: (sectionId: string) => void; onClose: () => void }> = ({
  isOpen, document, onSelectMatch, onClose
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (isOpen) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);

  const matches: SearchMatch[] = [];
  if (query.trim().length > 1) {
    const q = query.toLowerCase();
    document.sections.forEach((sec) => sec.paragraphs.forEach((p) => {
      let pos = p.toLowerCase().indexOf(q);
      while (pos !== -1) {
        const s = Math.max(0, pos - 35), e = Math.min(p.length, pos + q.length + 55);
        matches.push({ sectionId: sec.id, sectionTitle: sec.title, snippet: (s > 0 ? '...' : '') + p.substring(s, e) + (e < p.length ? '...' : ''), matchIndex: pos, fullParagraph: p });
        pos = p.toLowerCase().indexOf(q, pos + q.length);
      }
    }));
  }
  useEffect(() => { if (listRef.current && matches.length) listRef.current.querySelector('.search-result-item.active')?.scrollIntoView({ block: 'nearest' }); }, [selectedIndex, matches.length]);
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <Search size={18} className="search-input-icon" />
          <input ref={inputRef} type="text" className="search-input" value={query} placeholder="Search document sections and text..."
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
              else if (e.key === 'ArrowDown' && matches.length) { e.preventDefault(); setSelectedIndex((p) => (p + 1) % matches.length); }
              else if (e.key === 'ArrowUp' && matches.length) { e.preventDefault(); setSelectedIndex((p) => (p - 1 + matches.length) % matches.length); }
              else if (e.key === 'Enter' && matches[selectedIndex]) { e.preventDefault(); onSelectMatch(matches[selectedIndex].sectionId); onClose(); }
            }} />
          {query && <button type="button" className="icon-btn search-clear-btn" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X size={16} /></button>}
        </div>
        <div className="search-meta-bar">
          <span className="search-stats">{query.trim().length <= 1 ? 'Type at least 2 characters to search' : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} in "${document.title}"`}</span>
          <div className="search-nav-hints"><span><ArrowUp size={12} /><ArrowDown size={12} /> to navigate</span><span><Kbd size="sm">Enter</Kbd> to jump</span><span><Kbd size="sm">Esc</Kbd> to close</span></div>
        </div>
        <div className="search-results-list" ref={listRef}>
          {query.trim().length > 1 && matches.length === 0 ? (
            <div className="search-empty-state"><p>No matches found for "{query}"</p><span className="empty-sub">Try searching for keywords, concepts, or author names.</span></div>
          ) : matches.map((m, idx) => (
            <div key={`${m.sectionId}-${idx}`} className={`search-result-item ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => { onSelectMatch(m.sectionId); onClose(); }} onMouseEnter={() => setSelectedIndex(idx)}>
              <div className="search-result-header"><span className="search-result-section">{m.sectionTitle}</span>{idx === selectedIndex && <span className="search-result-jump-badge"><CornerDownLeft size={12} /> Jump</span>}</div>
              <p className="search-result-snippet">{m.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CommandPalette: React.FC<{
  isOpen: boolean; document: Document; allDocuments: Document[]; currentTheme: ThemeMode; zenMode: boolean;
  onSelectDocument: (docId: string) => void; onSelectSection: (sectionId: string) => void;
  onTriggerAnnotation: (type: 'note' | 'question' | 'highlight' | 'bookmark') => void;
  onToggleReview: () => void; onToggleTheme: () => void; onToggleZen: () => void;
  onOpenShortcuts: () => void; onOpenNewDoc: () => void; onExportDoc: () => void; onClose: () => void;
}> = ({
  isOpen, document, allDocuments, currentTheme, zenMode, onSelectDocument, onSelectSection,
  onTriggerAnnotation, onToggleReview, onToggleTheme, onToggleZen, onOpenShortcuts, onOpenNewDoc, onExportDoc, onClose
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (isOpen) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);

    const actions = [
      { id: 'cmd-note', category: 'Annotation', title: 'Attach Note to active section', subtitle: 'Create a quick thought or reminder', icon: <FileText size={16} className="text-amber" />, shortcut: 'N', perform: () => onTriggerAnnotation('note') },
      { id: 'cmd-highlight', category: 'Annotation', title: 'Toggle Highlight on section', subtitle: 'Mark current section as important', icon: <Highlighter size={16} className="text-emerald" />, shortcut: 'M', perform: () => onTriggerAnnotation('highlight') },
      { id: 'cmd-question', category: 'Annotation', title: 'Attach Question to active section', subtitle: 'Log an inquiry to review later', icon: <HelpCircle size={16} className="text-cyan" />, shortcut: 'Q', perform: () => onTriggerAnnotation('question') },
      { id: 'cmd-bookmark', category: 'Annotation', title: 'Toggle Bookmark on section', subtitle: 'Save reading position', icon: <Bookmark size={16} className="text-rose" />, shortcut: 'B', perform: () => onTriggerAnnotation('bookmark') },
      { id: 'cmd-review', category: 'Navigation', title: 'Open Reading Review Mode', subtitle: 'Review highlights, questions, and notes', icon: <CheckSquare size={16} className="text-purple" />, shortcut: 'R', perform: onToggleReview },
      { id: 'cmd-theme', category: 'Preferences', title: `Cycle Theme (Current: ${currentTheme})`, subtitle: 'Toggle between Day and Night Mode', icon: <SunMoon size={16} />, shortcut: 'T', perform: onToggleTheme },
      { id: 'cmd-zen', category: 'Preferences', title: zenMode ? 'Exit Zen Mode' : 'Enter Zen Focus Mode', subtitle: 'Hide distraction panels for pure reading', icon: <Maximize2 size={16} />, shortcut: 'F', perform: onToggleZen },
      { id: 'cmd-shortcuts', category: 'Help', title: 'View Keyboard Shortcuts', subtitle: 'Cheatsheet of all keys', icon: <Keyboard size={16} />, shortcut: '?', perform: onOpenShortcuts },
      { id: 'cmd-new-doc', category: 'Library', title: 'Start / Paste New Document', subtitle: 'Add study material, essay, or book chapter', icon: <PlusCircle size={16} className="text-emerald" />, perform: onOpenNewDoc },
      { id: 'cmd-export', category: 'Export', title: 'Export Document & Annotations', subtitle: 'Copy clean markdown to clipboard', icon: <Download size={16} />, perform: onExportDoc },
      ...document.sections.map((sec) => ({ id: `sec-jump-${sec.id}`, category: 'Jump to Section', title: sec.title, subtitle: (sec.paragraphs[0]?.substring(0, 70) || '') + '...', icon: <List size={16} className="text-muted" />, shortcut: undefined, perform: () => onSelectSection(sec.id) })),
      ...allDocuments.filter((d) => d.id !== document.id).map((doc) => ({ id: `doc-switch-${doc.id}`, category: 'Switch Document', title: doc.title, subtitle: `By ${doc.author} • ${doc.readTimeMinutes} min read`, icon: <BookOpen size={16} className="text-muted" />, shortcut: undefined, perform: () => onSelectDocument(doc.id) }))
    ];
    const filtered = actions.filter((a) => !query.trim() || [a.title, a.subtitle || '', a.category].some((s) => s.toLowerCase().includes(query.toLowerCase())));
    useEffect(() => { if (listRef.current && filtered.length) listRef.current.querySelector('.palette-item.active')?.scrollIntoView({ block: 'nearest' }); }, [selectedIndex]);
    if (!isOpen) return null;

    return (
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modal-window palette-modal" onClick={(e) => e.stopPropagation()}>
          <div className="palette-input-wrap">
            <Search size={18} className="palette-search-icon" />
            <input ref={inputRef} type="text" className="palette-input" value={query} placeholder="Type a command or jump to section..."
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
                else if (e.key === 'ArrowDown' && filtered.length) { e.preventDefault(); setSelectedIndex((p) => (p + 1) % filtered.length); }
                else if (e.key === 'ArrowUp' && filtered.length) { e.preventDefault(); setSelectedIndex((p) => (p - 1 + filtered.length) % filtered.length); }
                else if (e.key === 'Enter' && filtered[selectedIndex]) { e.preventDefault(); filtered[selectedIndex].perform(); onClose(); }
              }} />
            <Kbd size="sm">Esc</Kbd>
          </div>
          <div className="palette-list" ref={listRef}>
            {filtered.length === 0 ? <div className="palette-empty">No commands match "{query}"</div> : filtered.map((item, idx) => (
              <div key={item.id} className={`palette-item ${idx === selectedIndex ? 'active' : ''}`} onClick={() => { item.perform(); onClose(); }} onMouseEnter={() => setSelectedIndex(idx)}>
                <div className="palette-item-icon">{item.icon}</div>
                <div className="palette-item-text">
                  <div className="palette-item-title-row"><span className="palette-item-title">{item.title}</span><span className="palette-item-category">{item.category}</span></div>
                  {item.subtitle && <span className="palette-item-subtitle">{item.subtitle}</span>}
                </div>
                {item.shortcut && <Kbd size="sm" variant={idx === selectedIndex ? 'accent' : 'default'}>{item.shortcut}</Kbd>}
              </div>
            ))}
          </div>
          <div className="palette-footer">
            <span>Navigate with <Kbd size="sm">↑</Kbd><Kbd size="sm">↓</Kbd></span><span>Execute with <Kbd size="sm">Enter</Kbd></span>
          </div>
        </div>
      </div>
    );
  };
