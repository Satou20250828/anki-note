import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeScreen, calcProgress } from "./home-screen";
import { loadTexts, loadFolders, saveTexts, saveFolders } from "@/lib/storage";
import type { Text } from "@/lib/types";

beforeEach(() => {
  localStorage.clear();
});

describe("HomeScreen", () => {
  it("初期状態では保存済みテキスト一覧が閉じている", () => {
    render(<HomeScreen />);
    expect(screen.queryByText("まだ保存されたテキストはありません")).not.toBeInTheDocument();
  });

  it("見出しをタップすると一覧が開閉する", () => {
    render(<HomeScreen />);
    const toggle = screen.getByText(/保存済みテキスト/);
    fireEvent.click(toggle);
    expect(screen.getByText("まだ保存されたテキストはありません")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByText("まだ保存されたテキストはありません")).not.toBeInTheDocument();
  });

  it("サンプルを使うボタンでタイトルと本文が入力される", () => {
    render(<HomeScreen />);
    fireEvent.click(screen.getByText("サンプルを使う"));
    expect(screen.getByLabelText("タイトル")).toHaveValue("自己紹介サンプル");
    expect((screen.getByLabelText("本文") as HTMLTextAreaElement).value.length).toBeGreaterThan(0);
  });

  it("本文が空の場合は分割してはじめるボタンが無効になる", () => {
    render(<HomeScreen />);
    expect(screen.getByText("分割してはじめる")).toBeDisabled();
  });

  it("テキストを登録するとlocalStorageに保存され、一覧に表示される", () => {
    render(<HomeScreen />);
    fireEvent.change(screen.getByLabelText("タイトル"), { target: { value: "面接原稿" } });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "一文目です。二文目です。" },
    });
    fireEvent.click(screen.getByText("分割してはじめる"));

    const saved = loadTexts();
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("面接原稿");
    expect(saved[0].chunks.length).toBeGreaterThan(0);

    expect(screen.getByText("面接原稿")).toBeInTheDocument();
  });

  it("ハンバーガーボタンでメニューを開くとフォルダ一覧が見える", () => {
    saveFolders([{ id: "f1", name: "面接用" }]);
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    expect(screen.getByText("表示フィルタ")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "面接用" })).toBeInTheDocument();
  });

  it("メニューでフォルダを選ぶと表示中ラベルとテキスト一覧が絞り込まれる", () => {
    saveFolders([{ id: "f1", name: "面接用" }]);
    saveTexts([
      {
        id: "t1",
        title: "面接原稿",
        rawText: "一文目。",
        folderId: "f1",
        bookmarked: false,
        chunkSize: 1,
        chunks: [{ sentences: [{ text: "一文目。", revealed: true, hinted: false, kwRevealed: false }], status: "new" }],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "t2",
        title: "スピーチ原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: false,
        chunkSize: 1,
        chunks: [{ sentences: [{ text: "一文目。", revealed: true, hinted: false, kwRevealed: false }], status: "new" }],
        createdAt: 2,
        updatedAt: 2,
      },
    ]);
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    fireEvent.click(screen.getByRole("radio", { name: "面接用" }));

    expect(screen.getByText("表示中：").nextSibling).toHaveTextContent("面接用");

    fireEvent.click(screen.getByText(/保存済みテキスト/));
    expect(screen.getByText("面接原稿")).toBeInTheDocument();
    expect(screen.queryByText("スピーチ原稿")).not.toBeInTheDocument();
  });

  it("新しいフォルダを作るとlocalStorageに保存され、登録フォームの選択肢にも現れる", () => {
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    fireEvent.click(screen.getByText("新しいフォルダを作る"));

    expect(loadFolders()).toHaveLength(1);
    expect(screen.getByLabelText("フォルダ")).toBeInTheDocument();
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
