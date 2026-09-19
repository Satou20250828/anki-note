import type { Folder, Text } from "./types";

const TEXTS_KEY = "anki-note-texts-v1";
const FOLDERS_KEY = "anki-note-folders-v1";

export function loadTexts(): Text[] {
  try {
    const raw = localStorage.getItem(TEXTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTexts(texts: Text[]): void {
  try {
    localStorage.setItem(TEXTS_KEY, JSON.stringify(texts));
  } catch {
    // localStorageが使えない環境では何もしない
  }
}

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFolders(folders: Folder[]): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {
    // localStorageが使えない環境では何もしない
  }
}
