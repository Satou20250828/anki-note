import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandingScreen } from "./landing-screen";

describe("LandingScreen", () => {
  it("見出しと「はじめる」ボタン（/appへのリンク）が表示される", () => {
    render(<LandingScreen />);
    expect(screen.getByText("どんな文章を覚えますか？")).toBeInTheDocument();

    const ctaLinks = screen.getAllByRole("link", { name: /はじめる/ });
    expect(ctaLinks[0]).toHaveAttribute("href", "/app");
  });

  it("デモの穴埋めモードに切り替えると、キーワードがタップ可能な空欄になり、タップで答えが表示される", () => {
    render(<LandingScreen />);
    fireEvent.click(screen.getByRole("button", { name: "穴埋めモード" }));

    const blanks = screen
      .getAllByRole("button")
      .filter((b) => /^　+$/.test(b.textContent ?? ""));
    expect(blanks.length).toBeGreaterThan(0);

    fireEvent.click(blanks[0]);
    expect(blanks[0].textContent).not.toMatch(/^　+$/);
  });

  it("デモのキーワードモードに切り替えると、キーワードがチップ表示される", () => {
    render(<LandingScreen />);
    fireEvent.click(screen.getByRole("button", { name: "キーワード抽出" }));

    expect(screen.getByText("長文暗記")).toBeInTheDocument();
  });
});
