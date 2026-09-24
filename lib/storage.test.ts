import { describe, it, expect, beforeEach } from "vitest";
import { loadTexts, saveTexts, loadFolders, saveFolders } from "./storage";
import type { Text, Folder } from "./types";

const sampleText: Text = {
  id: "t1",
  title: "サンプル",
  rawText: "これはサンプルです。",
  folderId: null,
  bookmarked: false,
  blockCount: 2,
  chunks: [],
  status: "new",
  createdAt: 0,
  updatedAt: 0,
};

const sampleFolder: Folder = { id: "f1", name: "面接用" };

beforeEach(() => {
  localStorage.clear();
});

describe("texts", () => {
  it("保存前は空配列を返す", () => {
    expect(loadTexts()).toEqual([]);
  });

  it("保存した内容をそのまま読み込める", () => {
    saveTexts([sampleText]);
    expect(loadTexts()).toEqual([sampleText]);
  });

  it("壊れたJSONが入っている場合は空配列を返す", () => {
    localStorage.setItem("anki-note-texts-v1", "{invalid json");
    expect(loadTexts()).toEqual([]);
  });
});

describe("folders", () => {
  it("保存前は空配列を返す", () => {
    expect(loadFolders()).toEqual([]);
  });

  it("保存した内容をそのまま読み込める", () => {
    saveFolders([sampleFolder]);
    expect(loadFolders()).toEqual([sampleFolder]);
  });

  it("壊れたJSONが入っている場合は空配列を返す", () => {
    localStorage.setItem("anki-note-folders-v1", "{invalid json");
    expect(loadFolders()).toEqual([]);
  });
});
