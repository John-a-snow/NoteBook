import React, { useState, useEffect, useRef } from 'react';
import type { Document, Annotation } from '../types';
import { Kbd } from './Kbd';
import { BookOpen, Plus, Trash2, X, Clock, Layers, MessageSquare } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean; documents: Document[]; activeDocId: string; annotations: Annotation[];
  onSelectDoc: (id: string) => void; onDeleteDoc: (id: string) => void;
  onOpenNewDoc: () => void; onClose: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen, documents, activeDocId, annotations, onSelectDoc, onDeleteDoc, onOpenNewDoc, onClose
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(() => Math.max(0, documents.findIndex((d) => d.id === activeDocId)));
  const [selectedAction, setSelectedAction] = useState<'open' | 'delete'>('open');
  const selectedCardRef = useRef<HTMLDivElement>(null);
  const canDelete = documents.length > 1;

  useEffect(() => { selectedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [selectedIndex]);
  useEffect(() => {
    if (isOpen) {
      const idx = documents.findIndex((d) => d.id === activeDocId);
      setSelectedIndex(idx >= 0 ? idx : 0);
      setSelectedAction('open');
    }
  }, [isOpen, activeDocId]);

  useEffect(() => {
    if (selectedIndex >= documents.length) setSelectedIndex(Math.max(0, documents.length - 1));
    if (!canDelete && selectedAction === 'delete') setSelectedAction('open');
  }, [documents.length, selectedIndex, canDelete, selectedAction]);

  useEffect(() => {
    if (!isOpen) return;
    const len = Math.max(1, documents.length);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); }
      else if (e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIndex((p) => (p + 1) % len);
        setSelectedAction('open');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIndex((p) => (p - 1 + len) % len);
        setSelectedAction('open');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); e.stopPropagation();
        if (selectedAction === 'open' && canDelete) {
          setSelectedAction('delete');
        } else {
          setSelectedIndex((p) => (p + 1) % len);
          setSelectedAction('open');
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); e.stopPropagation();
        if (selectedAction === 'delete') {
          setSelectedAction('open');
        } else {
          setSelectedIndex((p) => (p - 1 + len) % len);
          setSelectedAction(canDelete ? 'delete' : 'open');
        }
      } else if (e.key === 'Enter' && documents[selectedIndex]) {
        e.preventDefault(); e.stopPropagation();
        const targetDoc = documents[selectedIndex];
        if (selectedAction === 'delete' && canDelete) {
          onDeleteDoc(targetDoc.id);
          setSelectedAction('open');
        } else {
          onSelectDoc(targetDoc.id);
          onClose();
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && documents[selectedIndex] && canDelete) {
        e.preventDefault(); e.stopPropagation();
        onDeleteDoc(documents[selectedIndex].id);
        setSelectedAction('open');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault(); e.stopPropagation();
        onClose(); onOpenNewDoc();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isOpen, documents, selectedIndex, selectedAction, canDelete, onSelectDoc, onDeleteDoc, onClose, onOpenNewDoc]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window library-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap"><BookOpen size={20} className="text-emerald" /><h2 className="modal-title">Reading Library</h2></div>
          <div className="modal-header-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { onClose(); onOpenNewDoc(); }}><Plus size={14} /> New Document [N]</button>
            <button type="button" className="icon-btn close-btn" onClick={onClose} aria-label="Close library"><X size={18} /></button>
          </div>
        </div>

        <div className="library-list-wrap">
          {documents.length === 0 ? (
            <div className="library-empty">
              <p>Your library is empty.</p>
              <button type="button" className="btn btn-primary" onClick={() => { onClose(); onOpenNewDoc(); }}>Add Your First Reading</button>
            </div>
          ) : (
            <div className="library-grid">
              {documents.map((doc, idx) => {
                const isActive = doc.id === activeDocId;
                const isSelected = idx === selectedIndex;
                const isOpenFocused = isSelected && selectedAction === 'open';
                const isDeleteFocused = isSelected && selectedAction === 'delete';
                const docAnns = annotations.filter((a) => a.docId === doc.id);
                return (
                  <div key={doc.id} ref={isSelected ? selectedCardRef : null} tabIndex={0}
                    className={`library-doc-card ${isActive ? 'active-doc' : ''} ${isSelected ? 'is-arrow-selected' : ''}`}
                    onClick={() => { setSelectedIndex(idx); onSelectDoc(doc.id); onClose(); }}>
                    <div className="library-card-top">
                      <span className="library-category-badge">{doc.category}</span>
                      {isActive && <span className="current-reading-badge">Reading Now</span>}
                      {isSelected && (
                        <span className={`current-reading-badge ${isDeleteFocused ? 'delete-mode-badge' : 'selected-badge'}`}>
                          {isDeleteFocused ? 'Delete [↵]' : 'Selected [↵]'}
                        </span>
                      )}
                    </div>
                    <h3 className="library-doc-title">{doc.title}</h3>
                    <p className="library-doc-author">By {doc.author}</p>
                    <div className="library-doc-stats">
                      <span><Clock size={12} /> {doc.readTimeMinutes} min</span>
                      <span><Layers size={12} /> {doc.sections.length} sections</span>
                      <span><MessageSquare size={12} /> {docAnns.length} thoughts</span>
                    </div>
                    <div className="library-card-actions">
                      <button type="button"
                        className={`btn btn-secondary btn-sm select-doc-btn ${isOpenFocused ? 'is-btn-focused' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onSelectDoc(doc.id); onClose(); }}>
                        {isActive ? 'Continue' : 'Open'} {isOpenFocused && <span className="mc-arrow-cursor">◄</span>}
                      </button>
                      {canDelete && (
                        <button type="button"
                          className={`icon-btn delete-doc-btn ${isDeleteFocused ? 'is-delete-focused' : ''}`}
                          title="Delete document [→ then Enter]"
                          onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}>
                          <Trash2 size={14} /> {isDeleteFocused && <span className="mc-arrow-cursor">◄</span>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <span className="footer-hint">Use <Kbd size="sm">↑ ↓</Kbd> cards • <Kbd size="sm">← →</Kbd> Open / Delete • <Kbd size="sm">↵ Enter</Kbd> confirm • <Kbd size="sm">Esc</Kbd> close</span>
        </div>
      </div>
    </div>
  );
};
