import React, { useState, useRef } from 'react';
import type { Document } from '../types';
import { parsePastedTextToDocument } from '../utils/storage';
import { Kbd } from './Kbd';
import { PlusCircle, FileText, BookOpen, X } from 'lucide-react';

const SAMPLE_DOCUMENTS: Document[] = [];

interface NewDocModalProps {
  isOpen: boolean; onSave: (newDoc: Document) => void;
  onSelectSample: (sampleDoc: Document) => void; onClose: () => void;
}

export const NewDocModal: React.FC<NewDocModalProps> = ({ isOpen, onSave, onSelectSample, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'paste' | 'samples'>('paste');
  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number>(0);

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const pasteTabRef = useRef<HTMLButtonElement>(null);
  const samplesTabRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(parsePastedTextToDocument(title.trim() || 'Untitled Document', author.trim() || 'Self', category.trim() || 'Study Notes', content));
    onClose();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === 'ArrowRight' && (el.selectionStart === el.value.length || !el.value)) { e.preventDefault(); authorRef.current?.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); categoryRef.current?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pasteTabRef.current?.focus(); }
    else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); authorRef.current?.focus(); }
  };

  const handleAuthorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === 'ArrowLeft' && (el.selectionStart === 0 || !el.value)) { e.preventDefault(); titleRef.current?.focus(); }
    else if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); categoryRef.current?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); samplesTabRef.current?.focus(); }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === 'ArrowUp') { e.preventDefault(); titleRef.current?.focus(); }
    else if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); contentRef.current?.focus(); }
    else if (e.key === 'ArrowLeft' && (el.selectionStart === 0 || !el.value)) { e.preventDefault(); titleRef.current?.focus(); }
    else if (e.key === 'ArrowRight' && (el.selectionStart === el.value.length || !el.value)) { e.preventDefault(); authorRef.current?.focus(); }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (e.key === 'ArrowUp' && !el.value.substring(0, el.selectionStart).includes('\n')) { e.preventDefault(); categoryRef.current?.focus(); }
    else if (e.key === 'ArrowDown' && !el.value.substring(el.selectionEnd).includes('\n')) { e.preventDefault(); submitBtnRef.current?.focus(); }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit(e); }
    if (activeTab === 'samples') {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        const len = Math.max(1, SAMPLE_DOCUMENTS.length);
        if (e.key === 'ArrowLeft') { e.preventDefault(); setActiveTab('paste'); setTimeout(() => pasteTabRef.current?.focus(), 10); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setSelectedSampleIdx((p) => (p + 1) % len); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedSampleIdx((p) => (p - 1 + len) % len); }
        else if (e.key === 'Enter' && SAMPLE_DOCUMENTS[selectedSampleIdx]) { e.preventDefault(); onSelectSample(SAMPLE_DOCUMENTS[selectedSampleIdx]); onClose(); }
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window new-doc-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleModalKeyDown}>
        <div className="modal-header">
          <div className="modal-title-wrap"><PlusCircle size={20} className="text-emerald" /><h2 className="modal-title">Add Material to NOTEBOOK</h2></div>
          <button type="button" className="icon-btn close-btn" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>

        <div className="tab-switcher">
          <button ref={pasteTabRef} type="button" className={`tab-btn ${activeTab === 'paste' ? 'active' : ''}`} onClick={() => setActiveTab('paste')}
            onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); setActiveTab('samples'); setTimeout(() => samplesTabRef.current?.focus(), 10); } else if (e.key === 'ArrowDown') { e.preventDefault(); titleRef.current?.focus(); } }}>
            <FileText size={16} /><span>Paste Text or Markdown</span>
          </button>
          <button ref={samplesTabRef} type="button" className={`tab-btn ${activeTab === 'samples' ? 'active' : ''}`} onClick={() => setActiveTab('samples')}
            onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); setActiveTab('paste'); setTimeout(() => pasteTabRef.current?.focus(), 10); } else if (e.key === 'ArrowDown' && activeTab === 'paste') { e.preventDefault(); authorRef.current?.focus(); } }}>
            <BookOpen size={16} /><span>Curated Sample Texts</span>
          </button>
        </div>

        {activeTab === 'paste' ? (
          <form onSubmit={handleSubmit} className="new-doc-form">
            <div className="form-row grid-2">
              <div className="form-field">
                <label htmlFor="doc-title">Document Title *</label>
                <input ref={titleRef} id="doc-title" type="text" className="form-input" placeholder="e.g. Distributed Consensus Systems" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={handleTitleKeyDown} autoFocus required />
              </div>
              <div className="form-field">
                <label htmlFor="doc-author">Author</label>
                <input ref={authorRef} id="doc-author" type="text" className="form-input" placeholder="e.g. Leslie Lamport" value={author} onChange={(e) => setAuthor(e.target.value)} onKeyDown={handleAuthorKeyDown} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="doc-category">Category / Topic</label>
              <input ref={categoryRef} id="doc-category" type="text" className="form-input" placeholder="e.g. Computer Science, Philosophy, Economics" value={category} onChange={(e) => setCategory(e.target.value)} onKeyDown={handleCategoryKeyDown} />
            </div>
            <div className="form-field">
              <div className="label-row">
                <label htmlFor="doc-content">Content *</label>
                <span className="field-hint">Headings (# Section Name) automatically create chapters</span>
              </div>
              <textarea ref={contentRef} id="doc-content" className="form-textarea" rows={10} placeholder="Paste articles, research papers, chapters, or notes here...&#10;&#10;# Chapter 1: Foundations&#10;In the beginning..." value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleContentKeyDown} required />
            </div>
            <div className="modal-footer">
              <div className="prompt-hints">
                <span><Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">Enter</Kbd> Start Reading</span>
                <span><Kbd size="sm">Esc</Kbd> Cancel</span>
              </div>
              <div className="footer-actions">
                <button ref={cancelBtnRef} type="button" className="btn btn-secondary" onClick={onClose}
                  onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); submitBtnRef.current?.focus(); } else if (e.key === 'ArrowUp') { e.preventDefault(); contentRef.current?.focus(); } }}>Cancel</button>
                <button ref={submitBtnRef} type="submit" className="btn btn-primary" disabled={!content.trim()}
                  onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); cancelBtnRef.current?.focus(); } else if (e.key === 'ArrowUp') { e.preventDefault(); contentRef.current?.focus(); } }}>Start Reading</button>
              </div>
            </div>
          </form>
        ) : (
          <div className="sample-picker-view">
            <p className="sample-picker-sub">Select one of our curated high-signal essays to explore NOTEBOOK's keyboard reading experience:</p>
            <div className="samples-grid">
              {SAMPLE_DOCUMENTS.map((sample, idx) => (
                <div key={sample.id} tabIndex={0} className={`sample-card ${idx === selectedSampleIdx ? 'is-arrow-selected' : ''}`}
                  onClick={() => { setSelectedSampleIdx(idx); onSelectSample(sample); onClose(); }}>
                  <div className="sample-card-header"><span className="sample-category-tag">{sample.category}</span><span className="sample-time-tag">{sample.readTimeMinutes} min read</span></div>
                  <h3 className="sample-card-title">{sample.title}</h3><p className="sample-card-author">By {sample.author}</p>
                  <p className="sample-card-excerpt">{sample.sections[0]?.paragraphs[0]?.substring(0, 140)}...</p>
                  <div className="sample-card-footer">
                    <span className="sample-sections-count"><BookOpen size={14} /> {sample.sections.length} Sections</span>
                    <span className="sample-enter-cta">Press <Kbd size="sm">Enter</Kbd> to open</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

<span className="brand-pixel-box">NOTEBOOK</span>
<speechSynthesis = speak infront of pi