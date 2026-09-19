import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PracticeScreen } from "./practice-screen";
import { saveTexts, loadTexts } from "@/lib/storage";
import type { Text } from "@/lib/types";

function makeText(overrides: Partial<Text> = {}): Text {
  return {
    id: "t1",
    title: "面接原稿",
    rawText: "一文目です。二文目です。三文目です。",
    folderId: null,
    bookmarked: false,
    chunkSize: 1,
    chunks: [
      { sentences: [{ text: "一文目です。", revealed: true, hinted: false, kwRevealed: false }], status: "mastered" },
      { sentences: [{ text: "二文目です。", revealed: true, hinted: false, kwRevealed: false }], status: "new" },
      { sentences: [{ text: "東京タワーに3回行った。", revealed: true, hinted: false, kwRevealed: false }], status: "new" },
    ],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("PracticeScreen", () => {
  it("見つからないIDの場合は案内メッセージを表示する", () => {
    render(<PracticeScreen textId="missing" />);
    expect(screen.getByText("テキストが見つかりませんでした。")).toBeInTheDocument();
  });

  it("タイトル・進捗・本文（暗記モード）が表示される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    expect(screen.getByText("面接原稿")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByText("一文目です。")).toBeInTheDocument();
  });

  it("チャンクを切り替えると表示される文章も変わる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByLabelText("ブロック2"));
    expect(screen.getByText("二文目です。")).toBeInTheDocument();
  });

  it("穴埋めモードでは漢字・カタカナ・数字が空欄になり、タップで答え合わせできる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByLabelText("ブロック3"));
    fireEvent.click(screen.getByRole("tab", { name: "穴埋め" }));

    const blanks = screen.getAllByLabelText("空欄。タップして答えを表示");
    expect(blanks).toHaveLength(2);
    fireEvent.click(blanks[0]);
    expect(screen.getByLabelText("答え: 東京タワー")).toBeInTheDocument();
  });

  it("キーワードモードでは漢字・カタカナ・数字だけがチップ表示される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByLabelText("ブロック3"));
    fireEvent.click(screen.getByRole("tab", { name: "キーワード" }));

    expect(screen.getByText("東京タワー")).toBeInTheDocument();
    expect(screen.getByText("3回行")).toBeInTheDocument();
  });

  it("習得状況を変更するとlocalStorageに反映される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByText("暗記中"));

    const saved = loadTexts();
    expect(saved[0].chunks[0].status).toBe("learning");
  });

  it("ブックマークを切り替えるとlocalStorageに反映される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByLabelText("お気に入りに追加"));

    const saved = loadTexts();
    expect(saved[0].bookmarked).toBe(true);
  });

  it("最初のブロックでは前のブロックボタンが無効になる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    expect(screen.getByText("前のブロック")).toBeDisabled();
  });
});
