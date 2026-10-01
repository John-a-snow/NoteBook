import React, { useState } from 'react';
import type { Annotation, AnnotationType, DocSection } from '../types';
import { Kbd } from './Kbd';
import { MessageSquare, HelpCircle, Highlighter, Bookmark, Trash2, Check, CheckCircle2, CornerDownLeft, Plus, Filter } from 'lucide-react';

interface MarginThinkingSpaceProps {
  section: DocSection; documentId: string; annotations: Annotation[]; showAll: boolean;
  onToggleShowAll: () => void; onAddAnnotation: (type: AnnotationType, content?: string, quote?: string) => void;
  onDeleteAnnotation: (id: string) => void; onToggleResolveQuestion: (id: string) => void;
  onJumpToSection: (sectionId: string) => void; onTriggerPrompt: (type: 'note' | 'question') => void;
  isMarginFocused?: boolean; selectedMarginTarget?: 'note' | 'mark' | 'ask' | 'save' | number;
}

const BADGE_ICON: Record<AnnotationType, React.ReactNode> = {
  note: <MessageSquare size={13} className="text-amber" />,
  question: <HelpCircle size={13} className="text-cyan" />,
  highlight: <Highlighter size={13} className="text-emerald" />,
  bookmark: <Bookmark size={13} className="text-rose fill-rose" />
};
const TYPE_NAME: Record<AnnotationType, string> = { note: 'Note', question: 'Question', highlight: 'Highlight', bookmark: 'Bookmark' };

export const MarginThinkingSpace: React.FC<MarginThinkingSpaceProps> = ({
  section, documentId, annotations, showAll, onToggleShowAll, onAddAnnotation,
  onDeleteAnnotation, onToggleResolveQuestion, onJumpToSection, onTriggerPrompt,
  isMarginFocused = false, selectedMarginTarget = 'note'
}) => {
  const [quickInputType, setQuickInputType] = useState<AnnotationType | null>(null);
  const [quickText, setQuickText] = useState('');

  const displayed = annotations.filter((a) => a.docId === documentId && (showAll || a.sectionId === section.id));
  const hasHighlight = annotations.some((a) => a.docId === documentId && a.sectionId === section.id && a.type === 'highlight');
  const hasBookmark = annotations.some((a) => a.docId === documentId && a.sectionId === section.id && a.type === 'bookmark');
  const isSel = (t: string) => isMarginFocused && selectedMarginTarget === t;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim() || !quickInputType) return;
    onAddAnnotation(quickInputType, quickText.trim(), section.paragraphs[0]?.substring(0, 100));
    setQuickText(''); setQuickInputType(null);
  };

  return (
    <aside className="app-margin-panel" aria-label="Thinking Margin">
      <div className="margin-panel-header">
        <div className="margin-header-top">
          <button type="button" className={`margin-filter-toggle ${showAll ? 'active' : ''}`} onClick={onToggleShowAll}
            title={showAll ? 'Showing thoughts across all sections' : 'Showing thoughts for active section only'}>
            <Filter size={12} /><span>{showAll ? 'All Sections' : 'Current Section'}</span>
          </button>
        </div>
        <div className="margin-quick-bar">
          <button type="button" className={`margin-action-chip chip-note ${isSel('note') ? 'is-arrow-selected' : ''}`} onClick={() => onTriggerPrompt('note')} title="Attach Note (Press N)">
            <MessageSquare size={13} /><span>Note</span><Kbd size="sm">N</Kbd>{isSel('note') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`margin-action-chip chip-highlight ${hasHighlight ? 'is-active' : ''} ${isSel('mark') ? 'is-arrow-selected' : ''}`} onClick={() => onAddAnnotation('highlight', undefined, section.paragraphs[0]?.substring(0, 120))} title="Mark Highlight (Press M)">
            <Highlighter size={13} /><span>Mark</span><Kbd size="sm">M</Kbd>{isSel('mark') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`margin-action-chip chip-question ${isSel('ask') ? 'is-arrow-selected' : ''}`} onClick={() => onTriggerPrompt('question')} title="Attach Question (Press Q)">
            <HelpCircle size={13} /><span>Ask</span><Kbd size="sm">Q</Kbd>{isSel('ask') && <span className="mc-arrow-cursor">◄</span>}
          </button>
          <button type="button" className={`margin-action-chip chip-bookmark ${hasBookmark ? 'is-active' : ''} ${isSel('save') ? 'is-arrow-selected' : ''}`} onClick={() => onAddAnnotation('bookmark', undefined, section.paragraphs[0]?.substring(0, 100))} title="Toggle Bookmark (Press B)">
            <Bookmark size={13} /><span>Save</span><Kbd size="sm">B</Kbd>{isSel('save') && <span className="mc-arrow-cursor">◄</span>}
          </button>
        </div>
      </div>

      {quickInputType && (
        <form className="margin-inline-composer" onSubmit={handleQuickSubmit}>
          <div className="composer-header">
            <span className="composer-label">Add {quickInputType === 'question' ? 'Question' : 'Note'}</span>
            <button type="button" className="icon-btn-sm" onClick={() => { setQuickInputType(null); setQuickText(''); }}>✕</button>
          </div>
          <textarea className="composer-textarea" rows={2} value={quickText} onChange={(e) => setQuickText(e.target.value)}
            placeholder={quickInputType === 'question' ? 'What question comes to mind?' : 'Write your margin note...'} autoFocus />
          <div className="composer-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={!quickText.trim()}><Plus size={13} /> Save Thought</button>
          </div>
        </form>
      )}

      <div className="margin-annotations-list">
        {displayed.length === 0 ? (
          <div className="margin-empty-state">
            <p className="empty-heading">No thoughts captured yet</p>
            <p className="empty-subtext">Use your keyboard while reading to attach notes, highlights, or questions:</p>
            <div className="empty-keys-list">
              <div className="empty-key-row"><Kbd size="sm">N</Kbd><span>Add a note</span></div>
              <div className="empty-key-row"><Kbd size="sm">M</Kbd><span>Highlight section</span></div>
              <div className="empty-key-row"><Kbd size="sm">Q</Kbd><span>Ask a question</span></div>
              <div className="empty-key-row"><Kbd size="sm">B</Kbd><span>Bookmark position</span></div>
            </div>
          </div>
        ) : displayed.map((ann) => (
          <div key={ann.id} className={`margin-card card-${ann.type} ${ann.resolved ? 'is-resolved' : ''}`}>
            <div className="margin-card-top">
              <div className="margin-card-type-tag">
                {BADGE_ICON[ann.type]}<span className={`type-name type-text-${ann.type}`}>{TYPE_NAME[ann.type]}</span>
              </div>
              <div className="margin-card-tools">
                {ann.type === 'question' && (
                  <button type="button" className={`resolve-btn ${ann.resolved ? 'resolved' : ''}`} title={ann.resolved ? 'Mark as unresolved' : 'Mark as resolved'} onClick={() => onToggleResolveQuestion(ann.id)}>
                    {ann.resolved ? <CheckCircle2 size={14} /> : <Check size={14} />}
                  </button>
                )}
                {ann.sectionId !== section.id && (
                  <button type="button" className="jump-sec-btn" title="Jump to original section" onClick={() => onJumpToSection(ann.sectionId)}><CornerDownLeft size={13} /></button>
                )}
                <button type="button" className="delete-ann-btn" title="Delete annotation" onClick={() => onDeleteAnnotation(ann.id)}><Trash2 size={13} /></button>
              </div>
            </div>
            {ann.quote && <div className="margin-card-quote"><p>"{ann.quote}"</p></div>}
            {ann.content && <div className="margin-card-content"><p>{ann.content}</p></div>}
            <div className="margin-card-footer">
              <span className="margin-card-date">{new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {ann.resolved && <span className="resolved-pill">Resolved</span>}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
