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
    const [userPrefs, setUserPrefs] = useState<UserPrefs>(()