"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { ChunkStatus, Text } from "@/lib/types"
import { loadTexts, saveTexts } from "@/lib/storage"
import { calcProgress } from "@/lib/textProcessing"
import { PracticeHeader } from "./practice-header"
import { BlockTabs } from "./block-tabs"
import { ModeTabs, type PracticeMode } from "./mode-tabs"
import { TextDisplay } from "./text-display"
import { StatusSelector } from "./status-selector"
import { BlockNav } from "./block-nav"

export function PracticeScreen({ textId }: { textId: string }) {
  const [text, setText] = useState<Text | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [activeChunk, setActiveChunk] = useState(0)
  const [mode, setMode] = useState<PracticeMode>("memorize")

  useEffect(() => {
    const found = loadTexts().find((t) => t.id === textId) ?? null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(found)
    setLoaded(true)
  }, [textId])

  const updateText = (updater: (t: Text) => Text) => {
    setText((prev) => {
      if (!prev) return prev
      const updated = updater(prev)
      const all = loadTexts().map((t) => (t.id === updated.id ? updated : t))
      saveTexts(all)
      return updated
    })
  }

  if (loaded && !text) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#e7edf7] px-4 py-6 text-[#1f2f52]">
        <p>テキストが見つかりませんでした。</p>
        <Link href="/" className="font-medium text-[#3a5a9c] underline">
          ホームに戻る
        </Link>
      </main>
    )
  }

  if (!text) return null

  const chunk = text.chunks[activeChunk]

  const toggleFavorite = () => updateText((t) => ({ ...t, bookmarked: !t.bookmarked, updatedAt: Date.now() }))

  const setStatus = (status: ChunkStatus) => {
    updateText((t) => ({
      ...t,
      updatedAt: Date.now(),
      chunks: t.chunks.map((c, i) => (i === activeChunk ? { ...c, status } : c)),
    }))
  }

  const goPrev = () => setActiveChunk((i) => Math.max(0, i - 1))
  const goNext = () => setActiveChunk((i) => Math.min(text.chunks.length - 1, i + 1))

  return (
    <main className="min-h-dvh bg-[#e7edf7] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
        <PracticeHeader
          title={text.title}
          progress={calcProgress(text)}
          favorite={text.bookmarked}
          onToggleFavorite={toggleFavorite}
        />

        <BlockTabs count={text.chunks.length} activeIndex={activeChunk} onSelect={setActiveChunk} />

        <ModeTabs active={mode} onChange={setMode} />

        <TextDisplay key={`${activeChunk}-${mode}`} chunk={chunk} mode={mode} />

        <StatusSelector value={chunk.status} onChange={setStatus} />

        <BlockNav
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={activeChunk > 0}
          hasNext={activeChunk < text.chunks.length - 1}
        />
      </div>
    </main>
  )
}
