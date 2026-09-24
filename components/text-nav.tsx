"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"

type TextNavProps = {
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

/** 同じフォルダ内の前後の保存済みテキストへ移動する */
export function TextNav({ onPrev, onNext, hasPrev, hasNext }: TextNavProps) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="テキストの移動">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#1f2f52] transition-colors hover:bg-[#d5e0f2] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        前のテキストへ
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#1f2f52] transition-colors hover:bg-[#d5e0f2] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
      >
        次のテキストへ
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
