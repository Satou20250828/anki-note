import { describe, it, expect } from "vitest";
import { splitSentences, buildChunks, makeTitle, extractKeywordSegments } from "./textProcessing";

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

  it("句読点がなくても改行を文の区切りとして扱う", () => {
    const result = splitSentences("今日は天気がいい\n公園に散歩に行った\nとても気持ちよかった");
    expect(result).toEqual(["今日は天気がいい", "公園に散歩に行った", "とても気持ちよかった"]);
  });

  it("改行と句読点が混在していても正しく分割する", () => {
    const result = splitSentences("一行目です。二行目も一文です。\n三行目\n四行目です。五行目です。");
    expect(result).toEqual(["一行目です。", "二行目も一文です。", "三行目", "四行目です。", "五行目です。"]);
  });

  it("空行は無視する", () => {
    const result = splitSentences("一行目\n\n\n二行目");
    expect(result).toEqual(["一行目", "二行目"]);
  });
});

describe("buildChunks", () => {
  it("指定した分割数ちょうどのブロックに、文字数がほぼ均等になるよう分割する", () => {
    const chunks = buildChunks("一二三四五六七八九十", 5);
    expect(chunks).toHaveLength(5);
    expect(chunks.map((c) => c.sentences[0].text)).toEqual(["一二", "三四", "五六", "七八", "九十"]);
  });

  it("割り切れない文字数でも指定した分割数ちょうどになり、元の文章を復元できる", () => {
    const chunks = buildChunks("一二三四五六七", 3);
    expect(chunks).toHaveLength(3);
    expect(chunks.map((c) => c.sentences[0].text).join("")).toBe("一二三四五六七");
  });

  it("句読点や改行が一切なくても指定した分割数どおりに分割できる", () => {
    const chunks = buildChunks("くとうてんもかいぎょうもないぶんしょう", 4);
    expect(chunks).toHaveLength(4);
  });

  it("分割数が文字数を超える場合は文字数と同じ数のブロックになる", () => {
    const chunks = buildChunks("あいう", 10);
    expect(chunks).toHaveLength(3);
  });

  it("空文字の場合は空配列を返す", () => {
    expect(buildChunks("", 5)).toEqual([]);
  });

  it("各ブロックはrevealed:trueの初期状態を持つ", () => {
    const chunks = buildChunks("一文字", 1);
    expect(chunks[0].sentences[0]).toEqual({
      text: "一文字",
      revealed: true,
      hinted: false,
      kwRevealed: false,
    });
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
