"use client"

import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"

type PracticeHeaderProps = {
  title: string
  progress: number
  favorite: boolean
  onToggleFavorite: () => void
}

export function PracticeHeader({ title, progress, favorite, onToggleFavorite }: PracticeHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-[#3a5a9c] transition-colors hover:text-[#1f2f52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          別のテキストを追加
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? "お気に入りから外す" : "お気に入りに追加"}
            className="inline-flex size-9 items-center justify-center rounded-full text-[#3a5a9c] transition-colors hover:bg-[#d5e0f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
          >
            <Star className={`size-5 ${favorite ? "fill-[#f2b705] text-[#f2b705]" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#1f2f52]">{title}</h1>

        <div className="flex items-center gap-3">
          <div
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#cdd9ef]"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="暗記の進捗"
          >
            <div
              className="h-full rounded-full bg-[#3a5a9c] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-11 text-right text-sm font-semibold tabular-nums text-[#1f2f52]">{progress}%</span>
        </div>
      </div>
    </header>
  )
}
