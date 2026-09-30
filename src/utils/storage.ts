import type { Document, Annotation, UserPrefs } from '../types';

const KEYS = {
  DOCS: 'bookmark_docs_v3',
  ACTIVE: 'bookmark_active_id_v3',
  ANNOTS: 'bookmark_annots_v3',
  PREFS: 'bookmark_prefs_v3'
};

export const DEFAULT_PREFS: UserPrefs = {
  theme: 'light',
  fontFamily: 'serif',
  fontSize: 'md',
  zenMode: false,
  showAllMarginAnnotations: false
};

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const loadDocuments = (): Document[] => {
  const documents = readJSON<Document[]>(KEYS.DOCS, []);
  return Array.isArray(documents) ? documents : [];
};

export const saveDocuments = (documents: Document[]) =>
  writeJSON(KEYS.DOCS, documents);

export const loadActiveDocId = (defaultId: string): string => {
  try {
    return localStorage.getItem(KEYS.ACTIVE) || defaultId;
  } catch {
    return defaultId;
  }
};

export const saveActiveDocId = (id: string) => {
  try {
    localStorage.setItem(KEYS.ACTIVE, id);
  } catch {}
};

export const loadAnnotations = (): Annotation[] => {
  const annotations = readJSON<Annotation[]>(KEYS.ANNOTS, []);
  return Array.isArray(annotations) ? annotations : [];
};

export const saveAnnotations = (annotations: Annotation[]) =>
  writeJSON(KEYS.ANNOTS, annotations);

export const loadUserPrefs = (): UserPrefs => ({
  ...DEFAULT_PREFS,
  ...readJSON<Partial<UserPrefs>>(KEYS.PREFS, {})
});

export const saveUserPrefs = (prefs: UserPrefs) =>
  writeJSON(KEYS.PREFS, prefs);

export function parsePastedTextToDocument(
  title: string,
  author: string,
  category: string,
  rawText: string
): Document {
  const sections: {
    id: string;
    title: string;
    content: string;
    paragraphs: string[];
  }[] = [];

  let currentTitle = 'Section 1';
  let currentParagraphs: string[] = [];
  let index = 1;

  for (const raw of rawText.split('\n')) {
    const line = raw.trim();

    if (!line) continue;

    if (/^(#|Chapter|Section|Part )/i.test(line)) {
      if (currentParagraphs.length) {
        sections.push({
          id: `sec-${Date.now()}-${index++}`,
          title: currentTitle,
          content: currentParagraphs.join('\n\n'),
          paragraphs: [...currentParagraphs]
        });

        currentParagraphs = [];
      }

      currentTitle =
        line.replace(/^#+\s*/, '') || `Section ${index}`;
    } else {
      currentParagraphs.push(line);
    }
  }

  if (currentParagraphs.length || !sections.length) {
    const paragraphs = currentParagraphs.length
      ? currentParagraphs
      : ['No content provided.'];

    sections.push({
      id: `sec-${Date.now()}-${index}`,
      title: currentTitle,
      content: paragraphs.join('\n\n'),
      paragraphs
    });
  }

  const words = rawText.split(/\s+/).filter(Boolean).length;

  return {
    id: `doc-${Date.now()}`,
    title: title.trim() || 'Untitled Reading',
    author: author.trim() || 'Anonymous',
    category: category.trim() || 'Article',
    readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
    sections,
    lastReadSectionId: sections[0].id,
    createdAt: new Date().toISOString()
  };
}