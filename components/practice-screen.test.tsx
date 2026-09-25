import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
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
    blockCount: 3,
    chunks: [
      { sentences: [{ text: "一文目です。", revealed: true, hinted: false, kwRevealed: false }] },
      { sentences: [{ text: "二文目です。", revealed: true, hinted: false, kwRevealed: false }] },
      { sentences: [{ text: "東京タワーに3回行った。", revealed: true, hinted: false, kwRevealed: false }] },
    ],
    status: "new",
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

  it("タイトルが表示され、全ブロックの本文が一覧表示される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    expect(screen.getByText("面接原稿")).toBeInTheDocument();
    expect(screen.getByText("一文目です。")).toBeInTheDocument();
    expect(screen.getByText("二文目です。")).toBeInTheDocument();
  });

  it("ブロックごとに個別に隠す/表示を切り替えられる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);

    const hideButtons = screen.getAllByLabelText("このブロックを隠す");
    fireEvent.click(hideButtons[0]);

    expect(screen.queryByText("一文目です。")).not.toBeInTheDocument();
    expect(screen.getByText("二文目です。")).toBeInTheDocument();
  });

  it("全部隠す/全部表示ボタンで全ブロックを一括切り替えできる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);

    fireEvent.click(screen.getByText("全部隠す"));
    expect(screen.queryByText("一文目です。")).not.toBeInTheDocument();
    expect(screen.queryByText("二文目です。")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("全部表示"));
    expect(screen.getByText("一文目です。")).toBeInTheDocument();
    expect(screen.getByText("二文目です。")).toBeInTheDocument();
  });

  it("穴埋めモードでは漢字・カタカナ・数字が空欄になり、タップで答え合わせできる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByRole("tab", { name: "穴埋め" }));

    const blanks = screen.getAllByLabelText("空欄。タップして答えを表示");
    expect(blanks.length).toBeGreaterThan(0);
    fireEvent.click(blanks[0]);
  });

  it("キーワードモードでは漢字・カタカナ・数字だけがチップ表示される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByRole("tab", { name: "キーワード" }));

    expect(screen.getByText("東京タワー")).toBeInTheDocument();
    expect(screen.getByText("3回行")).toBeInTheDocument();
  });

  it("テキスト単位で習得状況を変更でき、localStorageに反映される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);

    fireEvent.change(screen.getByLabelText("このテキストの習得状況"), { target: { value: "learning" } });

    const saved = loadTexts();
    expect(saved[0].status).toBe("learning");
  });

  it("タイトルを編集するとlocalStorageと画面表示に反映される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);

    fireEvent.click(screen.getByLabelText("タイトルを編集"));
    fireEvent.change(screen.getByLabelText("テキストのタイトル"), { target: { value: "新しいタイトル" } });
    fireEvent.click(screen.getByLabelText("タイトルを確定"));

    expect(screen.getByText("新しいタイトル")).toBeInTheDocument();
    const saved = loadTexts();
    expect(saved[0].title).toBe("新しいタイトル");
  });

  it("タイトルの編集で空文字を確定しても、元のタイトルのままになる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);

    fireEvent.click(screen.getByLabelText("タイトルを編集"));
    fireEvent.change(screen.getByLabelText("テキストのタイトル"), { target: { value: "   " } });
    fireEvent.click(screen.getByLabelText("タイトルを確定"));

    expect(screen.getByText("面接原稿")).toBeInTheDocument();
    const saved = loadTexts();
    expect(saved[0].title).toBe("面接原稿");
  });

  it("ブックマークを切り替えるとlocalStorageに反映される", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    fireEvent.click(screen.getByLabelText("ブックマークに追加"));

    const saved = loadTexts();
    expect(saved[0].bookmarked).toBe(true);
  });

  it("同じフォルダに他のテキストがない場合は前後のテキストへのボタンが無効になる", () => {
    saveTexts([makeText()]);
    render(<PracticeScreen textId="t1" />);
    expect(screen.getByText("前のテキストへ")).toBeDisabled();
    expect(screen.getByText("次のテキストへ")).toBeDisabled();
  });

  it("同じフォルダ内に他のテキストがある場合は次のテキストへ移動できる", () => {
    saveTexts([
      makeText({ id: "t1", title: "1件目", folderId: "f1", updatedAt: 2 }),
      makeText({ id: "t2", title: "2件目", folderId: "f1", updatedAt: 1 }),
    ]);
    render(<PracticeScreen textId="t1" />);
    expect(screen.getByText("次のテキストへ")).not.toBeDisabled();
    expect(screen.getByText("前のテキストへ")).toBeDisabled();
  });
});
