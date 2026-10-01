import React, { useEffect, useRef } from 'react';
import type { DocSection, Annotation, AnnotationType, FontFamily, FontSize } from '../types';
import { Kbd } from './Kbd';
import { Bookmark, Highlighter, HelpCircle, MessageSquare, ChevronLeft, ChevronRight, Compass, BookOpen } from 'lucide-react';

interface ReadingViewProps {
  sections: DocSection[]; activeSectionId: string; activeParaIndex?: number; annotations: Annotation[];
  fontFamily: FontFamily; fontSize: FontSize; lastActionToast: string | null;
  onSelectSection: (sectionId: string, paraIdx?: number) => void; onQuickAnnotate: (type: AnnotationType) => void;
  onTriggerPrompt: (type: 'note' | 'question') => void; onOpenNewDoc?: () => void;
  onOpenLibrary?: () => void; emptyTarget?: 'addDoc' | 'library'; isReadingFocused?: boolean;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  sections, activeSectionId, activeParaIndex = 0, annotations, fontFamily, fontSize, lastActionToast,
  onSelectSection, onQuickAnnotate, onTriggerPrompt, onOpenNewDoc, onOpenLibrary,
  emptyTarget = 'addDoc', isReadingFocused = true
}) => {
  const activeParaRef = useRef<HTMLDivElement>(null);
  const activeIndex = sections.findIndex((s) => s.id === activeSectionId);

  useEffect(() => {
    activeParaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeSectionId, activeParaIndex]);

  return (
    <main className={`reading-canvas-container font-family-${fontFamily} font-size-${fontSize}`} tabIndex={0} aria-label="Reading Canvas">
      {lastActionToast && (
        <div className="keyboard-feedback-hud" role="status" aria-live="polite">
          <span className="hud-indicator-dot" /><span>{lastActionToast}</span>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="mc-empty-reading-state">
          <div className="mc-empty-book-card">
            <BookOpen size={48} className="mc-empty-icon" />
            <h2 className="mc-empty-title">YOUR BOOKSHELF IS EMPTY</h2>
            <p className="mc-empty-desc">
              All previous sample documents have been removed. Add your own notes, research, chapters, or articles to start reading with keyboard precision.
            </p>
            <div className="mc-empty-actions-grid">
              {onOpenNewDoc && (
                <button type="button" className={`btn btn-primary mc-empty-create-btn ${emptyTarget === 'addDoc' ? 'is-arrow-selected' : ''}`} onClick={onOpenNewDoc}>
                  + ADD FIRST DOCUMENT [N] {emptyTarget === 'addDoc' && <span className="mc-arrow-cursor">◄</span>}
                </button>
              )}
              {onOpenLibrary && (
                <button type="button" className={`mc-empty-action-btn ${emptyTarget === 'library' ? 'is-arrow-selected' : ''}`} onClick={onOpenLibrary}>
                  <BookOpen size={14} /><span>LIBRARY [L]</span>{emptyTarget === 'library' && <span className="mc-arrow-cursor">◄</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="reading-content-flow">
          {sections.map((section, idx) => {
            const isActive = section.id === activeSectionId;
            const secAnns = annotations.filter((a) => a.sectionId === section.id);
            const isHighlighted = secAnns.some((a) => a.type === 'highlight');
            const isBookmarked = secAnns.some((a) => a.type === 'bookmark');
            const secNotes = secAnns.filter((a) => a.type === 'note');
            const secQuestions = secAnns.filter((a) => a.type === 'question');

            return (
              <article key={section.id} tabIndex={0}
                className={`reading-section-block ${isActive ? 'is-active-section' : 'is-inactive-section'} ${isHighlighted ? 'is-highlighted-block' : ''}`}
                onClick={() => onSelectSection(section.id, 0)}>
                <div className="section-gutter-marker">
                  <span className="gutter-num">{String(idx + 1).padStart(2, '0')}</span>
                  {isActive && <div className="active-glow-pillar" />}
                </div>
                <div className="section-main-body">
                  <div className="section-heading-row">
                    <h2 className="section-heading-title">{section.title}</h2>
                    <div className="section-status-indicators">
                      {isBookmarked && <span className="badge-pill pill-bookmark"><Bookmark size={12} className="fill-rose" /> Bookmarked</span>}
                      {isHighlighted && <span className="badge-pill pill-highlight"><Highlighter size={12} /> Highlighted</span>}
                      {secQuestions.length > 0 && <span className="badge-pill pill-question"><HelpCircle size={12} /> {secQuestions.length} Q</span>}
                      {secNotes.length > 0 && <span className="badge-pill pill-note"><MessageSquare size={12} /> {secNotes.length} Note</span>}
                    </div>
                  </div>
                  <div className="section-text-prose">
                    {section.paragraphs.map((p, pIdx) => {
                      const isParaActive = isActive && isReadingFocused && pIdx === activeParaIndex;
                      const paraAnns = secAnns.filter((a) => a.quote === p || (a.quote && p.includes(a.quote)));
                      const paraHigh = paraAnns.some((a) => a.type === 'highlight');
                      const paraQs = paraAnns.filter((a) => a.type === 'question');
                      const paraNotes = paraAnns.filter((a) => a.type === 'note');

                      return (
                        <div key={pIdx} ref={isParaActive ? activeParaRef : null}
                          className={`prose-paragraph-wrap ${isParaActive ? 'is-active-para' : ''} ${paraHigh ? 'has-inline-highlight' : ''}`}
                          onClick={(e) => { e.stopPropagation(); onSelectSection(section.id, pIdx); }}>
                          <div className="prose-para-row">
                            <span className="para-cursor-gutter">{isParaActive ? '►' : `P${pIdx + 1}`}</span>
                            <p className="prose-paragraph">{p}</p>
                          </div>
                          {(paraHigh || paraQs.length > 0 || paraNotes.length > 0) && (
                            <div className="para-inline-tags">
                              {paraHigh && <span className="para-tag tag-highlight"><Highlighter size={11} /> Highlighted [M]</span>}
                              {paraQs.map((q) => <span key={q.id} className="para-tag tag-question"><HelpCircle size={11} /> Q: {q.content}</span>)}
                              {paraNotes.map((n) => <span key={n.id} className="para-tag tag-note"><MessageSquare size={11} /> Note: {n.content}</span>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {isActive && (
                    <div className="active-section-control-bar">
                      <div className="section-action-buttons">
                        <button type="button" className="sec-action-btn" onClick={(e) => { e.stopPropagation(); onTriggerPrompt('note'); }}>
                          <MessageSquare size={14} className="text-amber" /><span>Note on P{activeParaIndex + 1}</span><Kbd size="sm">N</Kbd>
                        </button>
                        <button type="button" className="sec-action-btn" onClick={(e) => { e.stopPropagation(); onQuickAnnotate('highlight'); }}>
                          <Highlighter size={14} className="text-emerald" /><span>Highlight P{activeParaIndex + 1}</span><Kbd size="sm">M</Kbd>
                        </button>
                        <button type="button" className="sec-action-btn" onClick={(e) => { e.stopPropagation(); onTriggerPrompt('question'); }}>
                          <HelpCircle size={14} className="text-cyan" /><span>Ask on P{activeParaIndex + 1}</span><Kbd size="sm">Q</Kbd>
                        </button>
                        <button type="button" className="sec-action-btn" onClick={(e) => { e.stopPropagation(); onQuickAnnotate('bookmark'); }}>
                          <Bookmark size={14} className="text-rose" /><span>Bookmark</span><Kbd size="sm">B</Kbd>
                        </button>
                      </div>
                      <div className="section-navigation-cues">
                        <span><Kbd size="sm">↑ ↓</Kbd> Move Paragraph • <Kbd size="sm">J / K</Kbd> Section</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          <div className="reading-pager-navigation">
            <button type="button" className="pager-nav-btn prev-btn" disabled={activeIndex === 0} onClick={() => activeIndex > 0 && onSelectSection(sections[activeIndex - 1].id, 0)}>
              <ChevronLeft size={16} /><span>Previous Section</span><Kbd size="sm">K</Kbd>
            </button>
            <div className="pager-status-center"><Compass size={14} /><span>Section {activeIndex + 1} of {sections.length}</span></div>
            <button type="button" className="pager-nav-btn next-btn" disabled={activeIndex === sections.length - 1} onClick={() => activeIndex < sections.length - 1 && onSelectSection(sections[activeIndex + 1].id, 0)}>
              <span>Next Section</span><Kbd size="sm">J</Kbd><ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
