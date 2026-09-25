"use client"

import { useMemo } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { Chunk } from "@/lib/types"
import { extractKeywordSegments } from "@/lib/textProcessing"
import type { PracticeMode } from "./mode-tabs"
import { ClozeSentence } from "./cloze-sentence"

type TextDisplayProps = {
  chunk: Chunk
  mode: PracticeMode
  revealed: boolean
  onToggleReveal: () => void
}

/** 1ブロック分の表示。revealedがfalseの間は中身を見せず、タップで表示に切り替える */
export function TextDisplay({ chunk, mode, revealed, onToggleReveal }: TextDisplayProps) {
  if (!revealed) {
    return (
      <button
        type="button"
        onClick={onToggleReveal}
        aria-label="このブロックを表示する"
        className="flex min-h-32 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-medium text-[#3a5a9c] ring-1 ring-[#cdd9ef] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
      >
        <Eye className="size-4" aria-hidden="true" />
        タップで表示
      </button>
    )
  }

  return (
    <div className="relative min-h-32 w-full rounded-2xl bg-white p-5 ring-1 ring-[#cdd9ef]">
      <button
        type="button"
        onClick={onToggleReveal}
        aria-label="このブロックを隠す"
        className="absolute right-4 top-4 inline-flex items-center gap-1 text-xs font-medium text-[#3a5a9c] hover:text-[#1f2f52]"
      >
        <EyeOff className="size-4" aria-hidden="true" />
        隠す
      </button>
      <div className="pt-8">
        {mode === "memorize" && <MemorizeContent chunk={chunk} />}
        {mode === "cloze" && <ClozeContent chunk={chunk} />}
        {mode === "keyword" && <KeywordContent chunk={chunk} />}
      </div>
    </div>
  )
}

function MemorizeContent({ chunk }: { chunk: Chunk }) {
  return (
    <div className="space-y-3">
      {chunk.sentences.map((sentence, i) => (
        <p key={i} className="text-lg leading-relaxed text-[#1f2f52]">
          {sentence.text}
        </p>
      ))}
    </div>
  )
}

/** 穴埋め：自動検出した漢字・カタカナ・数字の並びを空欄にし、個別にタップして答え合わせする */
function ClozeContent({ chunk }: { chunk: Chunk }) {
  return (
    <div className="space-y-3 leading-relaxed">
      {chunk.sentences.map((sentence, si) => (
        <p key={si} className="text-lg text-[#1f2f52]">
          <ClozeSentence text={sentence.text} />
        </p>
      ))}
    </div>
  )
}

/** キーワード：自動検出した漢字・カタカナ・数字の並びだけを手がかりとして表示する */
function KeywordContent({ chunk }: { chunk: Chunk }) {
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
    <>
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
    </>
  )
}
