import type { Chunk, Sentence, Text } from "./types";

export function splitSentences(text: string): string[] {
  const trimmed = (text || "").trim();
  if (!trimmed) return [];

  // 改行も文の区切りとして扱う（句読点を付けずに1行1文で入力するケースに対応するため）
  const lines = trimmed.split(/\r?\n/);
  const sentences: string[] = [];
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    const parts = trimmedLine.split(/(?<=[。！？])\s*/);
    for (const part of parts) {
      const sentence = part.trim();
      if (sentence) sentences.push(sentence);
    }
  }
  return sentences;
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

export function calcProgress(text: Text): number {
  if (text.chunks.length === 0) return 0;
  const mastered = text.chunks.filter((c) => c.status === "mastered").length;
  return Math.round((mastered / text.chunks.length) * 100);
}

/** 漢字・カタカナ・数字・英字の連続をキーワードとみなして分割する */
const KEYWORD_CHAR = /[一-龯ァ-ヶー0-9A-Za-z]/;

export type TextSegment = { text: string; isKeyword: boolean };

export function extractKeywordSegments(sentence: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let i = 0;
  while (i < sentence.length) {
    const isKw = KEYWORD_CHAR.test(sentence[i]);
    let j = i + 1;
    while (j < sentence.length && KEYWORD_CHAR.test(sentence[j]) === isKw) j++;
    segments.push({ text: sentence.slice(i, j), isKeyword: isKw });
    i = j;
  }
  return segments;
}
