export type AnnotationType = 'note' | 'highlight' | 'question' | 'bookmark';
export type ThemeMode = 'light' | 'dark';
export type FontFamily = 'serif' | 'sans' | 'mono';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ActiveView = 'home' | 'read' | 'review' | 'library';

export interface DocSection {
  id: string;
  title: string;
  content: string;
  paragraphs: string[];
}

export interface Document {
  id: string;
  title: string;
  author: string;
  category: string;
  readTimeMinutes: number;
  sections: DocSection[];
  lastReadSectionId: string;
  createdAt: string;
  isSample?: boolean;
}

export interface Annotation {
  id: string;
  docId: string;
  sectionId: string;
  type: AnnotationType;
  quote?: string;
  content?: string;
  resolved?: boolean;
  createdAt: string;
}

export interface UserPrefs {
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: FontSize;
  zenMode: boolean;
  showAllMarginAnnotations: boolean;
}

export interface SearchMatch {
  sectionId: string;
  sectionTitle: string;
  snippet: string;
  matchIndex: number;
  fullParagraph: string;
}