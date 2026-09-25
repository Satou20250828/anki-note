"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import type { ChunkStatus, Text } from "@/lib/types"
import { loadTexts, saveTexts } from "@/lib/storage"
import { PracticeHeader } from "./practice-header"
import { ModeTabs, type PracticeMode } from "./mode-tabs"
import { TextDisplay } from "./text-display"
import { StatusSelector } from "./status-selector"
import { TextNav } from "./text-nav"

export function PracticeScreen({ textId }: { textId: string }) {
  const router = useRouter()
  const [allTexts, setAllTexts] = useState<Text[]>([])
  const [text, setText] = useState<Text | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [mode, setMode] = useState<PracticeMode>("memorize")
  const [revealed, setRevealed] = useState<boolean[]>([])

  useEffect(() => {
    const all = loadTexts()
    const found = all.find((t) => t.id === textId) ?? null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllTexts(all)
    setText(found)
    setRevealed(found ? found.chunks.map(() => true) : [])
    setLoaded(true)
  }, [textId])

  const updateText = (updater: (t: Text) => Text) => {
    setText((prev) => {
      if (!prev) return prev
      const updated = updater(prev)
      const all = loadTexts().map((t) => (t.id === updated.id ? updated : t))
      setAllTexts(all)
      saveTexts(all)
      return updated
    })
  }

  if (loaded && !text) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#e7edf7] px-4 py-6 text-[#1f2f52]">
        <p>テキストが見つかりませんでした。</p>
        <Link href="/app" className="font-medium text-[#3a5a9c] underline">
          ホームに戻る
        </Link>
      </main>
    )
  }

  if (!text) return null

  const toggleBookmark = () => updateText((t) => ({ ...t, bookmarked: !t.bookmarked, updatedAt: Date.now() }))

  const renameText = (title: string) => updateText((t) => ({ ...t, title, updatedAt: Date.now() }))

  const setStatus = (status: ChunkStatus) => {
    updateText((t) => ({ ...t, status, updatedAt: Date.now() }))
  }

  const toggleRevealed = (index: number) => {
    setRevealed((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  const allRevealed = revealed.length > 0 && revealed.every(Boolean)
  const toggleAllRevealed = () => {
    setRevealed(new Array(text.chunks.length).fill(!allRevealed))
  }

  // 前後のテキストへの移動は、同じフォルダ内・更新日時の新しい順に限定する
  const sameFolderTexts = [...allTexts]
    .filter((t) => t.folderId === text.folderId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
  const currentIndex = sameFolderTexts.findIndex((t) => t.id === text.id)
  const prevText = currentIndex > 0 ? sameFolderTexts[currentIndex - 1] : null
  const nextText = currentIndex >= 0 && currentIndex < sameFolderTexts.length - 1 ? sameFolderTexts[currentIndex + 1] : null

  return (
    <main className="min-h-dvh bg-[#e7edf7] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
        <PracticeHeader
          title={text.title}
          bookmarked={text.bookmarked}
          onToggleBookmark={toggleBookmark}
          onRename={renameText}
        />

        <StatusSelector value={text.status} onChange={setStatus} />

        <ModeTabs active={mode} onChange={setMode} />

        <button
          type="button"
          onClick={toggleAllRevealed}
          className="inline-flex w-fit items-center gap-1.5 self-end rounded-lg border border-[#3a5a9c]/40 px-3 py-1.5 text-xs font-semibold text-[#3a5a9c] transition-colors hover:bg-[#d5e0f2]"
        >
          {allRevealed ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          {allRevealed ? "全部隠す" : "全部表示"}
        </button>

        <div className="flex flex-col gap-5">
          {text.chunks.map((chunk, index) => (
            <TextDisplay
              key={index}
              chunk={chunk}
              mode={mode}
              revealed={revealed[index] ?? true}
              onToggleReveal={() => toggleRevealed(index)}
            />
          ))}
        </div>

        <TextNav
          onPrev={() => prevText && router.push(`/practice/${prevText.id}`)}
          onNext={() => nextText && router.push(`/practice/${nextText.id}`)}
          hasPrev={!!prevText}
          hasNext={!!nextText}
        />
      </div>
    </main>
  )
}
