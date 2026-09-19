"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { Chunk } from "@/lib/types"
import { extractKeywordSegments } from "@/lib/textProcessing"
import type { PracticeMode } from "./mode-tabs"

type TextDisplayProps = {
  chunk: Chunk
  mode: PracticeMode
}

export function TextDisplay({ chunk, mode }: TextDisplayProps) {
  if (mode === "memorize") {
    return <MemorizePanel chunk={chunk} />
  }
  if (mode === "cloze") {
    return <ClozePanel chunk={chunk} />
  }
  return <KeywordPanel chunk={chunk} />
}

/** 暗記モード：エリア全体をタップして本文の表示/非表示を切り替える */
function MemorizePanel({ chunk }: { chunk: Chunk }) {
  const [visible, setVisible] = useState(true)

  return (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      aria-pressed={visible}
      aria-label={visible ? "本文を隠す" : "本文を表示する"}
      className="group relative min-h-56 w-full rounded-2xl bg-white p-5 text-left ring-1 ring-[#cdd9ef] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
    >
      <span className="absolute right-4 top-4 inline-flex items-center gap-1 text-xs font-medium text-[#3a5a9c]">
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        タップで{visible ? "非表示" : "表示"}
      </span>

      <div className={`space-y-3 pt-8 transition ${visible ? "" : "select-none blur-sm"}`} aria-hidden={!visible}>
        {chunk.sentences.map((sentence, i) => (
          <p key={i} className="text-lg leading-relaxed text-[#1f2f52]">
            {sentence.text}
          </p>
        ))}
      </div>

      {!visible && (
        <span className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm font-medium text-[#3a5a9c]">
          思い出してからタップ
        </span>
      )}
    </button>
  )
}

/** 穴埋めモード：自動検出した漢字・カタカナ・数字の並びを空欄にし、個別にタップして答え合わせする */
function ClozePanel({ chunk }: { chunk: Chunk }) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const segmentsBySentence = useMemo(
    () => chunk.sentences.map((s) => extractKeywordSegments(s.text)),
    [chunk],
  )

  return (
    <div className="min-h-56 w-full rounded-2xl bg-white p-5 ring-1 ring-[#cdd9ef]">
      <div className="space-y-3 leading-relaxed">
        {segmentsBySentence.map((segments, si) => (
          <p key={si} className="text-lg text-[#1f2f52]">
            {segments.map((seg, i) => {
              if (!seg.isKeyword || !seg.text.trim()) return <span key={i}>{seg.text}</span>
              const key = `${si}-${i}`
              const isRevealed = revealed[key]
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
                  aria-label={isRevealed ? `答え: ${seg.text}` : "空欄。タップして答えを表示"}
                  className={`mx-0.5 inline-flex min-w-10 items-center justify-center rounded-md px-1.5 align-baseline text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c] ${
                    isRevealed
                      ? "bg-[#d5e0f2] text-[#1f2f52]"
                      : "bg-[#e7edf7] text-transparent ring-1 ring-dashed ring-[#3a5a9c]"
                  }`}
                >
                  {isRevealed ? seg.text : "　".repeat(seg.text.length)}
                </button>
              )
            })}
          </p>
        ))}
      </div>
    </div>
  )
}

/** キーワードモード：自動検出した漢字・カタカナ・数字の並びだけを手がかりとして表示する */
function KeywordPanel({ chunk }: { chunk: Chunk }) {
  const keywords = useMemo(
    () =>
      chunk.sentences.flatMap((s) =>
        extractKeywordSegments(s.text)
          .filter((seg) => seg.isKeyword && seg.text.trim())
          .map((seg) => seg.text),
      ),
    [chunk],
  )

  return (
    <div className="min-h-56 w-full rounded-2xl bg-white p-5 ring-1 ring-[#cdd9ef]">
      <ul className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <li key={i} className="rounded-full bg-[#1f2f52] px-4 py-1.5 text-base font-medium text-white">
            {kw}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm leading-relaxed text-[#3a5a9c]">
        キーワードを手がかりに、本文を思い出して声に出してみましょう。
      </p>
    </div>
  )
}
