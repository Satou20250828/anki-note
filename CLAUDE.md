# CLAUDE.md

このファイルは、このリポジトリで作業するClaude Code向けのガイドです。

## 技術スタック
- フロントエンド：Next.js（React＋TypeScript）＋Tailwind CSS。1本目「小さな帝国」（Vite＋Vanilla JS＋Tailwind）と異なるフレームワーク・言語構成にすることで、技術の幅を示す狙い
- バックエンド：なし（localStorageのみで完結する構成のため）
- DB：なし
- インフラ：Vercel（無料枠で無期限運用でき、Next.jsとの相性が良いため）
- UIデザイン：V0（v0.dev）で作成したReact＋Tailwindコードを取り込んで実装する

## コーディング規約
- ESLint + Prettierに従う

## テスト方針
- できる限り広くテストを書く（カバレッジを意識する）
- CI/CD（GitHub Actions）での自動実行に直結させる
- テスト基盤（Vitest）は環境構築と同時に導入し、以降の機能Issueは実装と同じPRにテストを含める

## 実装時の原則
- **ロジックより先に見た目（マークアップ）から着手する**。各Issueでは「①V0が生成した見た目のコードを先に取り込む→②その後で状態管理・ロジックを実装する」の順番を徹底する

## ブランチ命名規則・作業権限ルール
`../company/zentai/kaihatsu/テンプレート/01_開発ワークフロー.md`の「Git Flow運用ルール」「作業権限のルール」をそのまま適用する。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
