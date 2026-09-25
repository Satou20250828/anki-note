import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "暗記ノート",
  description: "長い文章をそのまま貼り付けるだけ。暗記・穴埋め・キーワードの3つの見せ方で、自分のペースで覚えられる暗記アプリ。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
