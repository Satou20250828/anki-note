import type { Chunk, Sentence } from "./types";

export function splitSentences(text: string): string[] {
  const trimmed = (text || "").trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/(?<=[。！？])\s*/);
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function buildChunks(sentences: string[], size: number): Chunk[] {
  const chunks: Chunk[] = [];
  for (let i = 0; i < sentences.length; i += size) {
    const group = sentences.slice(i, i + size);
    const sentenceObjects: Sentence[] = group.map((text) => ({
      text,
      revealed: true,
      hinted: false,
      kwRevealed: false,
    }));
    chunks.push({ sentences: sentenceObjects, status: "new" });
  }
  return chunks;
}

export function makeTitle(rawText: string): string {
  const first = (splitSentences(rawText)[0] || rawText).trim();
  return first.length > 22 ? first.slice(0, 22) + "…" : first || "無題のテキスト";
}
