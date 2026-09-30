import type { Document, Annotation, UserPrefs } from '../types';

const KEYS = { DOCS: 'bookmark_docs_v3', ACTIVE: 'bookmark_active_id_v3', ANNOTS: 'bookmark_annots_v3', PREFS: 'bookmark_prefs_v3' };
export const DEFAULT_PREFS: UserPrefs = { theme: 'light', fontFamily: 'serif', fontSize: 'md', zenMode: false, showAllMarginAnnotations: false };

const readJSON = <T,>(k: string, fb: T): T => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const writeJSON = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const loadDocuments = (): Document[] => { const d = readJSON<Document[]>(KEYS.DOCS, []); return Array.isArray(d) ? d : []; };
export const saveDocuments = (docs: Document[]) => writeJSON(KEYS.DOCS, docs);
export const loadActiveDocId = (defId: string): string => { try { return localStorage.getItem(KEYS.ACTIVE) || defId; } catch { return defId; } };
export const saveActiveDocId = (id: string) => { try { localStorage.setItem(KEYS.ACTIVE, id); } catch {} };
export const loadAnnotations = (): Annotation[] => { const a = readJSON<Annotation[]>(KEYS.ANNOTS, []); return Array.isArray(a) ? a : []; };
export const saveAnnotations = (a: Annotation[]) => writeJSON(KEYS.ANNOTS, a);
export const loadUserPrefs = (): UserPrefs => ({ ...DEFAULT_PREFS, ...readJSON<Partial<UserPrefs>>(KEYS.PREFS, {}) });
export const saveUserPrefs = (p: UserPrefs) => writeJSON(KEYS.PREFS, p);

export function parsePastedTextToDocument(title: string, author: string, category: string, rawText: string): Document {
  const sections: { id: string; title: string; content: string; paragraphs: string[] }[] = [];
  let curTitle = 'Section 1', curParas: string[] = [], idx = 1;
  for (const raw of rawText.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^(#|Chapter|Section|Part )/i.test(line)) {
      if (curParas.length) {
        sections.push({ id: `sec-${Date.now()}-${idx++}`, title: curTitle, content: curParas.join('\n\n'), paragraphs: [...curParas] });
        curParas = [];
      }
      curTitle = line.replace(/^#+\s*/, '') || `Section ${idx}`;
    } else curParas.push(line);
  }
  if (curParas.length || !sections.length) {
    const paras = curParas.length ? curParas : ['No content provided.'];
    sections.push({ id: `sec-${Date.now()}-${idx}`, title: curTitle, content: paras.join('\n\n'), paragraphs: paras });
  }
  const words = rawText.split(/\s+/).filter(Boolean).length;
  return {
    id: `doc-${Date.now()}`, title: title.trim() || 'Untitled Reading', author: author.trim() || 'Anonymous',
    category: category.trim() || 'Article', readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
    sections, lastReadSectionId: sections[0].id, createdAt: new Date().toISOString()
  };
}