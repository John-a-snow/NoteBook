import React, { useState, useEffect, useCallback } from 'react';
import { Document, Annotation, AnnotationType, ActiveView, UserPrefs, ThemeMode } from './types';
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
    const [userPrefs, setUserPrefs] = useState<UserPrefs>(() => loadUsersPrefs());
    const currentDoc = documents.find((d) => d.id === activeDocId) || documents[0] || EMPTY_DOC;

    const [activeSectionId, setActiveSectionId] = useState<string>(currentDoc.lastReadSectionId || currentDoc.sections[0]?.id || '');
    const currentSection = currentDoc.sections[activeSectionIndex] || currentDoc.sections[0] || { id: 'sec-1', title: 'Section', content: '', paragraphs: [] };
    const currentParaText = currentSection.paragraphs[activeParaIndex] || currentSection.paragraphs[0] || '';

    useEffect(() => { saveDocuments(documents); }, [documents]);

    useEffect(() => {
        safeActiveDocId(activeDocId);
        const doc = documents.find((d) => d.id === activedocId);
        if (doc?.sections.length) {
            setActiveSectionId(doc.lastReadSectionId || doc.sectios[0].id);
            setActiveParaIndex(0);
        }
    }, [activeDocId, documents]);

    useEffect(() => {
        saveUserPrefs(userPrefs);
        document.documentElement.setAttribute('data-theme', userPrefs.theme);
    }, [userPrefs]); 

    const showTost = (msg: string) => {
        setLastActionToast(msg);
        setTimeout(() => setLastActiveToast(p) => (p === msg ? null : p)), 2200);
    };

    const handleSelectSection = (secId: string, paraIdx = 0) => {
        setActiveSectionId(secId);
        setActiveParaIndex(paraIdx);
        setDocuments((prev) =>
            prev.map((d) =>
                d.id === currentDoc.id
                  ? {...d, lastReadSectionId: secId }
                  : d
            )
        );
    };

    const handleAddAnnotation = (
        type: AnnotationType,
        content?: string,
        quote?: string
    ) => {
        const sel = window.getSelection()?.toString().trim();
        