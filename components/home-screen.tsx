"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import type { Folder, Text } from "@/lib/types"
import { loadTexts, saveTexts, loadFolders, saveFolders } from "@/lib/storage"
import { splitSentences, buildChunks, makeTitle, calcProgress } from "@/lib/textProcessing"
import { MenuDrawer, type ViewFilter } from "./menu-drawer"

const SAMPLE_TITLE = "自己紹介サンプル"
const SAMPLE_BODY =
  "はじめまして。本日はお時間をいただきありがとうございます。私はこれまで営業として三年間働いてまいりました。お客様の課題を丁寧にヒアリングし、最適な提案を行うことを大切にしています。今後は御社でその経験を活かしたいと考えております。"

export function HomeScreen() {
  const [listOpen, setListOpen] = useState(false)
  const [texts, setTexts] = useState<Text[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [title, setTitle] = useState("")
  const [folderId, setFolderId] = useState<string>("")
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [body, setBody] = useState("")
  const [sentencesPerBlock, setSentencesPerBlock] = useState(2)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteArmedId, setDeleteArmedId] = useState<string | null>(null)
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all")
  const [viewFolderId, setViewFolderId] = useState<string | null>(null)

  useEffect(() => {
    // localStorageはサーバーサイドでは参照できないため、マウント後に読み込む
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTexts(loadTexts())
    setFolders(loadFolders())
  }, [])

  const decrement = () => setSentencesPerBlock((n) => Math.max(1, n - 1))
  const increment = () => setSentencesPerBlock((n) => Math.min(20, n + 1))

  const useSample = () => {
    setTitle(SAMPLE_TITLE)
    setBody(SAMPLE_BODY)
  }

  const handleStart = () => {
    const sentences = splitSentences(body)
    if (sentences.length === 0) return

    const now = Date.now()
    const newText: Text = {
      id: `t${now}`,
      title: title.trim() || makeTitle(body),
      rawText: body,
      folderId: folderId || null,
      bookmarked: false,
      chunkSize: sentencesPerBlock,
      chunks: buildChunks(sentences, sentencesPerBlock),
      createdAt: now,
      updatedAt: now,
    }

    const next = [...texts, newText]
    setTexts(next)
    saveTexts(next)
    setTitle("")
    setBody("")
    setFolderId("")
    setListOpen(true)
  }

  const handleFoldersChange = (next: Folder[]) => {
    setFolders(next)
    saveFolders(next)
  }

  const startCreatingFolder = () => {
    setCreatingFolder(true)
    setNewFolderName("")
  }

  const cancelCreatingFolder = () => {
    setCreatingFolder(false)
    setNewFolderName("")
  }

  const confirmCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    const newFolder: Folder = { id: `folder-${Date.now()}`, name }
    handleFoldersChange([...folders, newFolder])
    setFolderId(newFolder.id)
    setCreatingFolder(false)
    setNewFolderName("")
  }

  const handleDeleteClick = (id: string) => {
    if (deleteArmedId === id) {
      const next = texts.filter((t) => t.id !== id)
      setTexts(next)
      saveTexts(next)
      setDeleteArmedId(null)
    } else {
      setDeleteArmedId(id)
    }
  }

  const currentViewLabel =
    viewFilter === "all"
      ? "すべて"
      : viewFilter === "bookmark"
        ? "ブックマークのみ"
        : (folders.find((f) => f.id === viewFolderId)?.name ?? "未分類")

  const visibleTexts = texts.filter((t) => {
    if (viewFilter === "bookmark") return t.bookmarked
    if (viewFilter === "folder") return t.folderId === viewFolderId
    return true
  })

  const sortedTexts = [...visibleTexts].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="min-h-screen bg-[#e7edf7] text-[#1f2f52]">
      {/* Header */}
      <header className="bg-[#1f2f52] text-white">
        <div className="mx-auto w-full sm:max-w-[720px]">
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="text-lg font-bold tracking-wide">暗記ノート</h1>
            <button
              type="button"
              aria-label="メニューを開く"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <MenuIcon />
            </button>
          </div>
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-sm text-white/80 transition-colors hover:bg-white/10"
            >
              <span>表示中：</span>
              <span className="font-medium text-white">{currentViewLabel}</span>
              <ChevronDown className="text-white/80" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full sm:max-w-[720px]">
        <main className="px-4 pb-16">
          {/* Saved texts collapsible */}
          <section className="mt-4 overflow-hidden rounded-xl border border-[#3a5a9c]/20 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setListOpen((v) => !v)}
              aria-expanded={listOpen}
              className="flex w-full items-center gap-2 px-4 py-3.5 text-left transition-colors hover:bg-[#e7edf7]/60"
            >
              <ChevronRight
                className={`text-[#3a5a9c] transition-transform duration-200 ${listOpen ? "rotate-90" : ""}`}
              />
              <span className="font-semibold">
                保存済みテキスト（{sortedTexts.length}件）
              </span>
            </button>

            {listOpen && (
              <ul className="border-t border-[#3a5a9c]/15">
                {sortedTexts.length === 0 && (
                  <li className="px-4 py-3 pl-11 text-sm text-[#1f2f52]/50">
                    まだ保存されたテキストはありません
                  </li>
                )}
                {sortedTexts.map((item) => (
                  <li key={item.id} className="flex items-center gap-1 pl-11 pr-2">
                    <Link
                      href={`/practice/${item.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-[#e7edf7]/60"
                    >
                      <BookmarkStar filled={item.bookmarked} />
                      <span className="flex-1 truncate font-medium">{item.title}</span>
                      <span className="text-sm font-semibold tabular-nums text-[#3a5a9c]">
                        {calcProgress(item)}%
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item.id)}
                      aria-label={deleteArmedId === item.id ? `${item.title}を本当に削除する` : `${item.title}を削除`}
                      className={`shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                        deleteArmedId === item.id
                          ? "bg-red-600 text-white"
                          : "text-[#3a5a9c]/60 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      {deleteArmedId === item.id ? "本当に削除？" : <Trash2 className="size-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Add new text form */}
          <section className="mt-4 rounded-xl border border-[#3a5a9c]/20 bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-bold">新しいテキストを追加</h2>

            <div className="space-y-4">
              <Field label="タイトル" htmlFor="title">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：面接原稿"
                  className="w-full rounded-lg border border-[#3a5a9c]/30 bg-[#e7edf7]/30 px-3 py-2 text-[#1f2f52] outline-none transition-colors placeholder:text-[#1f2f52]/40 focus-visible:border-[#3a5a9c] focus-visible:ring-2 focus-visible:ring-[#3a5a9c]/30"
                />
              </Field>

              <Field label="フォルダ" htmlFor="folder">
                {creatingFolder ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return
                        if (e.key === "Enter") {
                          e.preventDefault()
                          confirmCreateFolder()
                        }
                        if (e.key === "Escape") cancelCreatingFolder()
                      }}
                      placeholder="新しいフォルダ名"
                      className="w-full rounded-lg border border-[#3a5a9c]/30 bg-white px-3 py-2 text-[#1f2f52] outline-none transition-colors focus-visible:border-[#3a5a9c] focus-visible:ring-2 focus-visible:ring-[#3a5a9c]/30"
                    />
                    <button
                      type="button"
                      onClick={confirmCreateFolder}
                      disabled={!newFolderName.trim()}
                      className="shrink-0 rounded-lg bg-[#1f2f52] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      作成
                    </button>
                    <button
                      type="button"
                      onClick={cancelCreatingFolder}
                      className="shrink-0 rounded-lg border border-[#3a5a9c]/40 px-3 py-2 text-sm font-semibold text-[#3a5a9c]"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      id="folder"
                      value={folderId}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          startCreatingFolder()
                          return
                        }
                        setFolderId(e.target.value)
                      }}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-[#3a5a9c]/30 bg-[#e7edf7]/30 px-3 py-2 pr-9 text-[#1f2f52] outline-none transition-colors focus-visible:border-[#3a5a9c] focus-visible:ring-2 focus-visible:ring-[#3a5a9c]/30"
                    >
                      <option value="">未分類</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                      <option value="__new__">＋ 新しいフォルダを作る</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#3a5a9c]" />
                  </div>
                )}
              </Field>

              <Field label="本文" htmlFor="body">
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="暗記したい文章を入力してください"
                  className="h-40 w-full resize-y rounded-lg border border-[#3a5a9c]/30 bg-[#e7edf7]/30 px-3 py-2 leading-relaxed text-[#1f2f52] outline-none transition-colors placeholder:text-[#1f2f52]/40 focus-visible:border-[#3a5a9c] focus-visible:ring-2 focus-visible:ring-[#3a5a9c]/30 sm:h-64"
                />
              </Field>

              <Field label="1ブロックの文数">
                <div className="inline-flex items-center gap-3">
                  <StepperButton onClick={decrement} aria-label="文数を減らす" disabled={sentencesPerBlock <= 1}>
                    −
                  </StepperButton>
                  <span className="w-8 text-center text-lg font-semibold tabular-nums" aria-live="polite">
                    {sentencesPerBlock}
                  </span>
                  <StepperButton onClick={increment} aria-label="文数を増やす" disabled={sentencesPerBlock >= 20}>
                    ＋
                  </StepperButton>
                </div>
              </Field>
            </div>

            {!splitSentences(body).length && body.length > 0 && (
              <p className="mt-3 text-sm text-red-600">文章を認識できませんでした。内容を確認してください。</p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleStart}
                disabled={!splitSentences(body).length}
                className="flex-1 rounded-lg bg-[#1f2f52] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#3a5a9c] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a9c] focus-visible:ring-offset-2"
              >
                分割してはじめる
              </button>
              <button
                type="button"
                onClick={useSample}
                className="flex-1 rounded-lg border border-[#3a5a9c] px-4 py-2.5 font-semibold text-[#3a5a9c] transition-colors hover:bg-[#e7edf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a9c] focus-visible:ring-offset-2"
              >
                サンプルを使う
              </button>
            </div>
          </section>
        </main>
      </div>

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        filter={viewFilter}
        onSelectAll={() => setViewFilter("all")}
        onSelectBookmark={() => setViewFilter("bookmark")}
        folders={folders}
        selectedFolderId={viewFolderId}
        onSelectFolder={(id) => {
          setViewFilter("folder")
          setViewFolderId(id)
        }}
        onFoldersChange={handleFoldersChange}
      />
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[#1f2f52]/80">
        {label}
      </label>
      {children}
    </div>
  )
}

function StepperButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3a5a9c]/40 bg-white text-xl font-medium text-[#3a5a9c] transition-colors hover:bg-[#e7edf7] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a9c]"
      {...props}
    >
      {children}
    </button>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function BookmarkStar({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "#f5b301" : "none"}
      stroke={filled ? "#f5b301" : "#3a5a9c"}
      strokeOpacity={filled ? 1 : 0.5}
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
