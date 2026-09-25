"use client"

import { useMemo, useState } from "react"
import { extractKeywordSegments } from "@/lib/textProcessing"

const SIZE_CLASS = {
  sm: "min-w-8 px-1 text-sm",
  md: "min-w-10 px-1.5 text-base",
}

type ClozeSentenceProps = {
  text: string
  size?: keyof typeof SIZE_CLASS
}

/** 1文分の穴埋め表示。自動検出したキーワードを空欄にし、個別にタップして答え合わせする（練習画面とLPのデモで共通） */
export function ClozeSentence({ text, size = "md" }: ClozeSentenceProps) {
  const [revealedBlanks, setRevealedBlanks] = useState<Record<number, boolean>>({})
  const segments = useMemo(() => extractKeywordSegments(text), [text])

  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.isKeyword || !seg.text.trim()) return <span key={i}>{seg.text}</span>
        const isRevealed = revealedBlanks[i]
        return (
          <button
            key={i}
            type="button"
            onClick={() => setRevealedBlanks((r) => ({ ...r, [i]: !r[i] }))}
            aria-label={isRevealed ? `答え: ${seg.text}` : "空欄。タップして答えを表示"}
            className={`mx-0.5 inline-flex items-center justify-center rounded-md align-baseline font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c] ${SIZE_CLASS[size]} ${
              isRevealed
                ? "bg-[#d5e0f2] text-[#1f2f52]"
                : "bg-[#e7edf7] text-transparent ring-1 ring-dashed ring-[#3a5a9c]"
            }`}
          >
            {isRevealed ? seg.text : "　".repeat(seg.text.length)}
          </button>
        )
      })}
    </>
  )
}
