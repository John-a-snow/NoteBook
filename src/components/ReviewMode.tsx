import React, { useState } from 'react';
import type { Document, Annotation, AnnotationType } from '../types';
import { Kbd } from './Kbd';
import { CheckSquare, Highlighter, HelpCircle, MessageSquare, Bookmark, ArrowLeft, CornerDownLeft, CheckCircle2, Check, Trash2, Copy, Sparkles, BookOpen } from 'lucide-react';

interface ReviewModeProps {
  document: Document; annotations: Annotation[];
  onSelectSection: (sectionId: string) => void; onReturnToReading: () => void;
  onToggleResolveQuestion: (id: string) => void; onDeleteAnnotation: (id: string) => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  document, annotations, onSelectSection, onReturnToReading, onToggleResolveQuestion, onDeleteAnnotation
}) => {
  const [filter, setFilter] = useState<'all' | AnnotationType>('all');
  const [copiedToast, setCopiedToast] = useState(false);

  const docAnns = annotations.filter((a) => a.docId === document.id);
  const highlights = docAnns.filter((a) => a.type === 'highlight');
  const questions = docAnns.filter((a) => a.type === 'question');
  const notes = docAnns.filter((a) => a.type === 'note');
  const bookmarks = docAnns.filter((a) => a.type === 'bookmark');
  const unresolvedCount = questions.filter((q) => !q.resolved).length;
  const filtered = docAnns.filter((a) => filter === 'all' || a.type === filter);
  const getSecTitle = (id: string) => document.sections.find((s) => s.id === id)?.title || 'Section';

  const handleExportMarkdown = () => {
    let md = `# Reading Review: ${document.title}\n**Author**: ${document.author}\n**Date**: ${new Date().toLocaleDateString()}\n\n## Summary Stats\n- Highlights: ${highlights.length}\n- Questions: ${questions.length} (${questions.length - unresolvedCount} resolved)\n- Notes: ${notes.length}\n- Bookmarks: ${bookmarks.length}\n\n`;
    if (highlights.length) { md += `## Highlights\n`; highlights.forEach((h) => { md += `> "${h.quote || 'Highlighted section'}"\n*— From ${getSecTitle(h.sectionId)}*\n\n`; }); }
    if (questions.length) { md += `## Questions\n`; questions.forEach((q) => { md += `### ${q.resolved ? '[x]' : '[ ]'} ${q.content}\n${q.quote ? `> "${q.quote}"\n` : ''}*Context: ${getSecTitle(q.sectionId)}*\n\n`; }); }
    if (notes.length) { md += `## Notes\n`; notes.forEach((n) => { md += `### Note: ${n.content}\n${n.quote ? `> "${n.quote}"\n` : ''}*From: ${getSecTitle(n.sectionId)}*\n\n`; }); }
    if (bookmarks.length) { md += `## Bookmarks\n`; bookmarks.forEach((b) => { md += `- **${getSecTitle(b.sectionId)}**\n`; }); }
    navigator.clipboard.writeText(md);
    setCopiedToast(true); setTimeout(() => setCopiedToast(false), 2500);
  };

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
            <button type="button" className="btn btn-secondary" onClick={handleExportMarkdown} title="Copy formatted Markdown review">
              {copiedToast ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copiedToast ? 'Copied Markdown!' : 'Export Review'}</span>
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
            <button type="button" className={`pill-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Items ({docAnns.length})</button>
            {stats.map((s) => (
              <button key={s.type} type="button" className={`pill-btn ${filter === s.type ? 'active' : ''}`} onClick={() => setFilter(s.type)}>
                {s.type.charAt(0).toUpperCase() + s.type.slice(1)}s ({s.count})
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
              <button type="button" className="btn btn-primary" onClick={onReturnToReading}>Back to Document</button>
            </div>
          ) : filtered.map((item) => (
            <article key={item.id} className={`review-entry-card entry-${item.type} ${item.resolved ? 'is-resolved' : ''}`}>
              <div className="review-entry-top">
                <div className="entry-type-pill">
                  {item.type === 'highlight' && <Highlighter size={13} className="text-emerald" />}
                  {item.type === 'question' && <HelpCircle size={13} className="text-cyan" />}
                  {item.type === 'note' && <MessageSquare size={13} className="text-amber" />}
                  {item.type === 'bookmark' && <Bookmark size={13} className="text-rose" />}
                  <span className="entry-type-title">{item.type.toUpperCase()}</span>
                </div>
                <div className="entry-context-link" onClick={() => onSelectSection(item.sectionId)}>
                  <BookOpen size={13} /><span>{getSecTitle(item.sectionId)}</span>
                </div>
                <div className="entry-actions-right">
                  {item.type === 'question' && (
                    <button type="button" className={`resolve-btn ${item.resolved ? 'resolved' : ''}`} onClick={() => onToggleResolveQuestion(item.id)}>
                      {item.resolved ? <CheckCircle2 size={16} /> : <Check size={16} />}<span>{item.resolved ? 'Resolved' : 'Resolve'}</span>
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary btn-sm jump-btn" onClick={() => onSelectSection(item.sectionId)}>
                    <CornerDownLeft size={13} /><span>Jump to context</span>
                  </button>
                  <button type="button" className="icon-btn delete-btn" onClick={() => onDeleteAnnotation(item.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {item.quote && <div className="review-entry-quote"><p>"{item.quote}"</p></div>}
              {item.content && <div className="review-entry-content"><p>{item.content}</p></div>}
              <div className="review-entry-footer">
                <span className="entry-timestamp">Saved {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
