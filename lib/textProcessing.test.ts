import { describe, it, expect } from "vitest";
import { splitSentences, buildChunks, makeTitle, calcProgress, extractKeywordSegments } from "./textProcessing";
import type { Text } from "./types";

describe("splitSentences", () => {
  it("句点・感嘆符・疑問符で文を分割する", () => {
    const result = splitSentences("今日は晴れ。明日は雨？きっと大丈夫！");
    expect(result).toEqual(["今日は晴れ。", "明日は雨？", "きっと大丈夫！"]);
  });

  it("前後の空白を取り除く", () => {
    const result = splitSentences("  こんにちは。  さようなら。 ");
    expect(result).toEqual(["こんにちは。", "さようなら。"]);
  });

  it("空文字列やスペースのみの場合は空配列を返す", () => {
    expect(splitSentences("")).toEqual([]);
    expect(splitSentences("   ")).toEqual([]);
  });
});

describe("buildChunks", () => {
  it("指定したサイズごとにチャンクへ分割する", () => {
    const sentences = ["一文目。", "二文目。", "三文目。", "四文目。", "五文目。"];
    const chunks = buildChunks(sentences, 2);
    expect(chunks).toHaveLength(3);
    expect(chunks[0].sentences.map((s) => s.text)).toEqual(["一文目。", "二文目。"]);
    expect(chunks[2].sentences.map((s) => s.text)).toEqual(["五文目。"]);
  });

  it("各文はrevealed:trueの初期状態を持つ", () => {
    const chunks = buildChunks(["一文目。"], 1);
    expect(chunks[0].sentences[0]).toEqual({
      text: "一文目。",
      revealed: true,
      hinted: false,
      kwRevealed: false,
    });
  });

  it("各チャンクの初期ステータスはnewである", () => {
    const chunks = buildChunks(["一文目。", "二文目。"], 1);
    expect(chunks.every((c) => c.status === "new")).toBe(true);
  });
});

describe("makeTitle", () => {
  it("最初の文をタイトルにする", () => {
    expect(makeTitle("これはテストです。次の文。")).toBe("これはテストです。");
  });

  it("22文字を超える場合は省略記号を付ける", () => {
    const longSentence = "あ".repeat(30) + "。";
    const title = makeTitle(longSentence);
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBe(23);
  });

  it("空文字の場合は無題のテキストを返す", () => {
    expect(makeTitle("")).toBe("無題のテキスト");
  });
});

describe("calcProgress", () => {
  const base: Text = {
    id: "t1",
    title: "テスト",
    rawText: "",
    folderId: null,
    bookmarked: false,
    chunkSize: 1,
    chunks: [],
    createdAt: 0,
    updatedAt: 0,
  };

  it("チャンクがない場合は0を返す", () => {
    expect(calcProgress(base)).toBe(0);
  });

  it("習得済みチャンクの割合を百分率で返す", () => {
    const text: Text = {
      ...base,
      chunks: [
        { sentences: [], status: "mastered" },
        { sentences: [], status: "learning" },
        { sentences: [], status: "new" },
        { sentences: [], status: "mastered" },
      ],
    };
    expect(calcProgress(text)).toBe(50);
  });
});

describe("extractKeywordSegments", () => {
  it("漢字・カタカナ・数字の連続をキーワードとして抽出する", () => {
    const segments = extractKeywordSegments("私は東京タワーに3回行った。");
    const keywords = segments.filter((s) => s.isKeyword).map((s) => s.text);
    expect(keywords).toEqual(["私", "東京タワー", "3回行"]);
  });

  it("ひらがな・句読点はキーワード扱いにしない", () => {
    const segments = extractKeywordSegments("これはテストです。");
    const nonKeywords = segments.filter((s) => !s.isKeyword).map((s) => s.text);
    expect(nonKeywords).toEqual(["これは", "です。"]);
  });

  it("元の文を全セグメントの結合で復元できる", () => {
    const sentence = "私は東京タワーに3回行った。";
    const segments = extractKeywordSegments(sentence);
    expect(segments.map((s) => s.text).join("")).toBe(sentence);
  });
});
