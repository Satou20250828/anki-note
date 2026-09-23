import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeScreen } from "./home-screen";
import { loadTexts, loadFolders, saveTexts, saveFolders } from "@/lib/storage";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
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

  it("本文が空の場合ははじめるボタンが無効になる", () => {
    render(<HomeScreen />);
    expect(screen.getByText("はじめる")).toBeDisabled();
  });

  it("テキストを登録するとlocalStorageに保存され、一覧に表示される", () => {
    render(<HomeScreen />);
    fireEvent.change(screen.getByLabelText("タイトル"), { target: { value: "面接原稿" } });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "一文目です。二文目です。" },
    });
    fireEvent.click(screen.getByText("はじめる"));

    const saved = loadTexts();
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("面接原稿");
    expect(saved[0].chunks.length).toBeGreaterThan(0);

    expect(pushMock).toHaveBeenCalledWith(`/practice/${saved[0].id}`);
  });

  it("句読点や改行がない本文でも、分割せず1ブロックとして登録される", () => {
    render(<HomeScreen />);
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "くとうてんもかいぎょうもないながいぶんしょうです" },
    });
    fireEvent.click(screen.getByText("はじめる"));

    const saved = loadTexts();
    expect(saved[0].chunks).toHaveLength(1);
    expect(saved[0].chunks[0].sentences[0].text).toBe("くとうてんもかいぎょうもないながいぶんしょうです");
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
        blockCount: 1,
        chunks: [{ sentences: [{ text: "一文目。", revealed: true, hinted: false, kwRevealed: false }] }],
        status: "new",
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "t2",
        title: "スピーチ原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: false,
        blockCount: 1,
        chunks: [{ sentences: [{ text: "一文目。", revealed: true, hinted: false, kwRevealed: false }] }],
        status: "new",
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

  it("メニューで「ブックマークのみ」を選ぶとブックマーク済みのテキストだけ表示される", () => {
    saveTexts([
      {
        id: "t1",
        title: "面接原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: true,
        blockCount: 1,
        chunks: [{ sentences: [{ text: "一文目。", revealed: true, hinted: false, kwRevealed: false }] }],
        status: "new",
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "t2",
        title: "スピーチ原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: false,
        blockCount: 1,
        chunks: [{ sentences: [{ text: "一文目。", revealed: true, hinted: false, kwRevealed: false }] }],
        status: "new",
        createdAt: 2,
        updatedAt: 2,
      },
    ]);
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    fireEvent.click(screen.getByText("ブックマークのみ"));

    expect(screen.getByText("表示中：").nextSibling).toHaveTextContent("ブックマークのみ");

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

  it("新しいテキストを追加フォームからも新規フォルダを作成できる", () => {
    render(<HomeScreen />);

    fireEvent.change(screen.getByLabelText("フォルダ"), { target: { value: "__new__" } });
    const input = screen.getByPlaceholderText("新しいフォルダ名");
    fireEvent.change(input, { target: { value: "面接用" } });
    fireEvent.click(screen.getByText("作成"));

    expect(loadFolders()).toEqual([{ id: expect.any(String), name: "面接用" }]);
    expect(screen.getByLabelText("フォルダ")).toHaveValue(loadFolders()[0].id);
    expect(screen.getByText("面接用", { selector: "option" })).toBeInTheDocument();
  });

  it("フォルダ作成をキャンセルすると選択欄に戻る", () => {
    render(<HomeScreen />);

    fireEvent.change(screen.getByLabelText("フォルダ"), { target: { value: "__new__" } });
    fireEvent.click(screen.getByText("キャンセル"));

    expect(loadFolders()).toEqual([]);
    expect(screen.getByLabelText("フォルダ")).toBeInTheDocument();
  });

  it("削除ボタンは1回目のタップでは削除せず、確認状態になる", () => {
    saveTexts([
      {
        id: "t1",
        title: "面接原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: false,
        blockCount: 1,
        chunks: [],
        status: "new",
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    render(<HomeScreen />);
    fireEvent.click(screen.getByText(/保存済みテキスト/));
    fireEvent.click(screen.getByLabelText("面接原稿を削除"));

    expect(loadTexts()).toHaveLength(1);
    expect(screen.getByLabelText("面接原稿を本当に削除する")).toBeInTheDocument();
  });

  it("削除ボタンを2回タップするとテキストが削除される", () => {
    saveTexts([
      {
        id: "t1",
        title: "面接原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: false,
        blockCount: 1,
        chunks: [],
        status: "new",
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    render(<HomeScreen />);
    fireEvent.click(screen.getByText(/保存済みテキスト/));
    fireEvent.click(screen.getByLabelText("面接原稿を削除"));
    fireEvent.click(screen.getByLabelText("面接原稿を本当に削除する"));

    expect(loadTexts()).toHaveLength(0);
    expect(screen.queryByText("面接原稿")).not.toBeInTheDocument();
  });

  it("保存済み一覧には習得状況のバッジが表示される", () => {
    saveTexts([
      {
        id: "t1",
        title: "面接原稿",
        rawText: "一文目。",
        folderId: null,
        bookmarked: false,
        blockCount: 1,
        chunks: [],
        status: "learning",
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    render(<HomeScreen />);
    fireEvent.click(screen.getByText(/保存済みテキスト/));
    expect(screen.getByText("暗記中")).toBeInTheDocument();
  });
});
