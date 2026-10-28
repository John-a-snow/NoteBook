import React, { useState, useEffect, useRef } from 'react';
import type { Document, Annotation, AnnotationType } from '../types';
import { Kbd } from './Kbd';
import { CheckSquare, Highlighter, HelpCircle, MessageSquare, Bookmark, ArrowLeft, CornerDownLeft, CheckCircle2, Check, Trash2, Copy, Sparkles, BookOpen } from 'lucide-react';

interface ReviewModeProps {
  document: Document;
  annotations: Annotation[];
  onSelectSection: (sectionId: string) => void;
  onReturnToReading: () => void;
  onToggleResolveQuestion: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

const FILTER_TYPES: Array<'all' | AnnotationType> = ['all', 'highlight', 'question', 'note', 'bookmark'];

export const ReviewMode: React.FC<ReviewModeProps> = ({
  document, annotations, onSelectSection, onReturnToReading, onToggleResolveQuestion, onDeleteAnnotation
}) => {
  const [filter, setFilter] = useState<'all' | AnnotationType>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copiedToast, setCopiedToast] = useState(false);
  const selectedItemRef = useRef<HTMLElement>(null);

  const docAnns = annotations.filter((a) => a.docId === document.id);
  const highlights = docAnns.filter((a) => a.type === 'highlight');
  const questions = docAnns.filter((a) => a.type === 'question');
  const notes = docAnns.filter((a) => a.type === 'note');
  const bookmarks = docAnns.filter((a) => a.type === 'bookmark');
  const unresolvedCount = questions.filter((q) => !q.resolved).length;
  const filtered = docAnns.filter((a) => filter === 'all' || a.type === filter);
  const getSecTitle = (id: string) => document.sections.find((s) => s.id === id)?.title || 'Section';

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    if (selectedIndex >= filtered.length && filtered.length > 0) {
      setSelectedIndex(filtered.length - 1);
    }
  }, [filtered.length, selectedIndex]);

  const handleExportMarkdown = () => {
    let md = `# Reading Review: ${document.title}\n**Author**: ${document.author}\n**Date**: ${new Date().toLocaleDateString()}\n\n## Summary Stats\n- Highlights: ${highlights.length}\n- Questions: ${questions.length} (${questions.length - unresolvedCount} resolved)\n- Notes: ${notes.length}\n- Bookmarks: ${bookmarks.length}\n\n`;
    if (highlights.length) { md += `## Highlights\n`; highlights.forEach((h) => { md += `> "${h.quote || 'Highlighted section'}"\n*— From ${getSecTitle(h.sectionId)}*\n\n`; }); }
    if (questions.length) { md += `## Questions\n`; questions.forEach((q) => { md += `### ${q.resolved ? '[x]' : '[ ]'} ${q.content}\n${q.quote ? `> "${q.quote}"\n` : ''}*Context: ${getSecTitle(q.sectionId)}*\n\n`; }); }
    if (notes.length) { md += `## Notes\n`; notes.forEach((n) => { md += `### Note: ${n.content}\n${n.quote ? `> "${n.quote}"\n` : ''}*From: ${getSecTitle(n.sectionId)}*\n\n`; }); }
    if (bookmarks.length) { md += `## Bookmarks\n`; bookmarks.forEach((b) => { md += `- **${getSecTitle(b.sectionId)}**\n`; }); }
    navigator.clipboard.writeText(md);
    setCopiedToast(true); setTimeout(() => setCopiedToast(false), 2500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.document.querySelector('[role="dialog"]')) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const len = filtered.length;
      if (e.key === 'Escape' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onReturnToReading();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportMarkdown();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (len > 0) setSelectedIndex((p) => (p + 1) % len);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (len > 0) setSelectedIndex((p) => (p - 1 + len) % len);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const fIdx = FILTER_TYPES.indexOf(filter);
        setFilter(FILTER_TYPES[(fIdx + 1) % FILTER_TYPES.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const fIdx = FILTER_TYPES.indexOf(filter);
        setFilter(FILTER_TYPES[(fIdx - 1 + FILTER_TYPES.length) % FILTER_TYPES.length]);
      } else if (e.key === 'Enter' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelectSection(filtered[selectedIndex].sectionId);
        }
      } else if (e.key === ' ' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        const current = filtered[selectedIndex];
        if (current && current.type === 'question') {
          onToggleResolveQuestion(current.id);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const current = filtered[selectedIndex];
        if (current) {
          onDeleteAnnotation(current.id);
        }
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const map: Record<string, typeof FILTER_TYPES[number]> = {
          '1': 'all', '2': 'highlight', '3': 'question', '4': 'note', '5': 'bookmark'
        };
        setFilter(map[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filter, filtered, selectedIndex, onReturnToReading, onSelectSection, onToggleResolveQuestion, onDeleteAnnotation]);

  const stats: { type: AnnotationType; count: number; label: string; icon: React.ReactNode }[] = [
    { type: 'highlight', count: highlights.length, label: 'Highlights', icon: <Highlighter size={18} className="text-emerald" /> },
    { type: 'question', count: questions.length, label: `Questions (${unresolvedCount} Open)`, icon: <HelpCircle size={18} className="text-cyan" /> },
    { type: 'note', count: notes.length, label: 'Notes', icon: <MessageSquare size={18} className="text-amber" /> },
    { type: 'bookmark', count: bookmarks.length, label: 'Bookmarks', icon: <Bookmark size={18} className="text-rose" /> },
  ];

  return (
    <div className="review-mode-view" aria-label="Reading Review">
      <div className="review-hero-card">
        <div className="review-hero-top">
          <div className="review-title-group">
            <div className="review-badge-icon"><CheckSquare size={22} className="text-emerald" /></div>
            <div>
              <h1 className="review-hero-title">Reading Review</h1>
              <p className="review-hero-sub">{document.title} • By {document.author}</p>
            </div>
          </div>
          <div className="review-hero-actions">
            <button type="button" className="btn btn-secondary" onClick={handleExportMarkdown} title="Copy formatted Markdown review [E]">
              {copiedToast ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copiedToast ? 'Copied Markdown!' : 'Export Review'}</span><Kbd size="sm">E</Kbd>
            </button>
            <button type="button" className="btn btn-primary" onClick={onReturnToReading}>
              <ArrowLeft size={15} /><span>Continue Reading</span><Kbd size="sm">Esc</Kbd>
            </button>
          </div>
        </div>
        <div className="review-stats-grid">
          {stats.map((s) => (
            <div key={s.type} className={`review-stat-card ${filter === s.type ? 'active-filter' : ''}`} onClick={() => setFilter(filter === s.type ? 'all' : s.type)}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-info"><span className="stat-card-number">{s.count}</span><span className="stat-card-label">{s.label}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="review-content-section">
        <div className="review-filters-bar">
          <div className="review-tab-pills">
            <button type="button" className={`pill-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All Items ({docAnns.length}) {filter === 'all' && <span className="mc-arrow-cursor-sm">◄</span>}
            </button>
            {stats.map((s) => (
              <button key={s.type} type="button" className={`pill-btn ${filter === s.type ? 'active' : ''}`} onClick={() => setFilter(s.type)}>
                {s.type.charAt(0).toUpperCase() + s.type.slice(1)}s ({s.count}) {filter === s.type && <span className="mc-arrow-cursor-sm">◄</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="review-items-stream">
          {filtered.length === 0 ? (
            <div className="review-empty-state">
              <Sparkles size={32} className="text-muted" />
              <h3>No annotations found for this filter</h3>
              <p>Start reading and use shortcut keys to capture notes and questions.</p>
              <button type="button" className="btn btn-primary" onClick={onReturnToReading}>Back to Document [Esc]</button>
            </div>
          ) : filtered.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <article key={item.id} ref={isSelected ? (selectedItemRef as React.RefObject<HTMLElement>) : null}
                className={`review-entry-card entry-${item.type} ${item.resolved ? 'is-resolved' : ''} ${isSelected ? 'is-arrow-selected is-active-review-item' : ''}`}
                onClick={() => onSelectSection(item.sectionId)}>
                <div className="review-entry-top">
                  <div className="entry-type-pill">
                    {item.type === 'highlight' && <Highlighter size={13} className="text-emerald" />}
                    {item.type === 'question' && <HelpCircle size={13} className="text-cyan" />}
                    {item.type === 'note' && <MessageSquare size={13} className="text-amber" />}
                    {item.type === 'bookmark' && <Bookmark size={13} className="text-rose" />}
                    <span className="entry-type-title">{item.type.toUpperCase()}</span>
                    {isSelected && <span className="mc-arrow-cursor">◄</span>}
                  </div>
                  <div className="entry-context-link" onClick={() => onSelectSection(item.sectionId)}>
                    <BookOpen size={13} /><span>{getSecTitle(item.sectionId)}</span>
                  </div>
                  <div className="entry-actions-right">
                    {item.type === 'question' && (
                      <button type="button" className={`resolve-btn ${item.resolved ? 'resolved' : ''}`} onClick={() => onToggleResolveQuestion(item.id)}>
                        {item.resolved ? <CheckCircle2 size={16} /> : <Check size={16} />}<span>{item.resolved ? 'Resolved [Space]' : 'Resolve [Space]'}</span>
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary btn-sm jump-btn" onClick={() => onSelectSection(item.sectionId)}>
                      <CornerDownLeft size={13} /><span>Jump [Enter]</span>
                    </button>
                    <button type="button" className="icon-btn delete-btn" title="Delete [Del]" onClick={() => onDeleteAnnotation(item.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                {item.quote && <div className="review-entry-quote"><p>"{item.quote}"</p></div>}
                {item.content && <div className="review-entry-content"><p>{item.content}</p></div>}
                <div className="review-entry-footer">
                  <span className="entry-timestamp">Saved {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="review-keyboard-bar">
          <span className="review-kbd-hint"><Kbd size="sm">↑ ↓</Kbd> Select Item</span>
          <span className="review-kbd-hint"><Kbd size="sm">← →</Kbd> Filter</span>
          <span className="review-kbd-hint"><Kbd size="sm">Enter</Kbd> Jump to Section</span>
          <span className="review-kbd-hint"><Kbd size="sm">Space</Kbd> Resolve Question</span>
          <span className="review-kbd-hint"><Kbd size="sm">Del</Kbd> Delete</span>
          <span className="review-kbd-hint"><Kbd size="sm">E</Kbd> Export</span>
          <span className="review-kbd-hint"><Kbd size="sm">Esc</Kbd> Back</span>
        </div>
      </div>
    </div>
  );
};
