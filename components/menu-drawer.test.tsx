import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuDrawer } from "./menu-drawer";
import type { Folder } from "@/lib/types";

const folders: Folder[] = [
  { id: "f1", name: "面接用" },
  { id: "f2", name: "スピーチ用" },
];

function setup(overrides: Partial<React.ComponentProps<typeof MenuDrawer>> = {}) {
  const props: React.ComponentProps<typeof MenuDrawer> = {
    open: true,
    onClose: vi.fn(),
    filter: "all",
    onSelectAll: vi.fn(),
    onSelectBookmark: vi.fn(),
    folders,
    selectedFolderId: null,
    onSelectFolder: vi.fn(),
    onFoldersChange: vi.fn(),
    onDeleteFolder: vi.fn(),
    ...overrides,
  };
  render(<MenuDrawer {...props} />);
  return props;
}

describe("MenuDrawer", () => {
  it("フォルダ一覧が表示される", () => {
    setup();
    expect(screen.getByText("未分類")).toBeInTheDocument();
    expect(screen.getByText("面接用")).toBeInTheDocument();
    expect(screen.getByText("スピーチ用")).toBeInTheDocument();
  });

  it("すべてをクリックするとonSelectAllが呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByText("すべて"));
    expect(props.onSelectAll).toHaveBeenCalled();
  });

  it("ブックマークのみをクリックするとonSelectBookmarkが呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByText("ブックマークのみ"));
    expect(props.onSelectBookmark).toHaveBeenCalled();
  });

  it("フォルダをクリックするとonSelectFolderが呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByText("面接用"));
    expect(props.onSelectFolder).toHaveBeenCalledWith("f1");
  });

  it("未分類をクリックするとnullでonSelectFolderが呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByText("未分類"));
    expect(props.onSelectFolder).toHaveBeenCalledWith(null);
  });

  it("新しいフォルダを作るとonFoldersChangeが呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByText("新しいフォルダを作る"));
    expect(props.onFoldersChange).toHaveBeenCalledWith([
      ...folders,
      { id: expect.any(String), name: "新しいフォルダ" },
    ]);
  });

  it("削除アイコンをクリックするとonDeleteFolderがそのフォルダのIDで呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByLabelText("面接用を削除"));
    expect(props.onDeleteFolder).toHaveBeenCalledWith("f1");
  });

  it("表示中のフォルダを削除すると「すべて」表示に戻る", () => {
    const props = setup({ filter: "folder", selectedFolderId: "f1" });
    fireEvent.click(screen.getByLabelText("面接用を削除"));
    expect(props.onSelectAll).toHaveBeenCalled();
  });

  it("閉じるボタンでonCloseが呼ばれる", () => {
    const props = setup();
    fireEvent.click(screen.getByLabelText("メニューを閉じる"));
    expect(props.onClose).toHaveBeenCalled();
  });
});
