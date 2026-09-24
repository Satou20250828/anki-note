"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Star, Pencil, Check } from "lucide-react"

type PracticeHeaderProps = {
  title: string
  favorite: boolean
  onToggleFavorite: () => void
  onRename: (title: string) => void
}

export function PracticeHeader({ title, favorite, onToggleFavorite, onRename }: PracticeHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEdit = () => {
    setDraftTitle(title)
    setEditing(true)
  }

  const commitEdit = () => {
    const name = draftTitle.trim()
    if (name) onRename(name)
    setEditing(false)
  }

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/app"
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

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            commitEdit()
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "Enter") commitEdit()
            }}
            aria-label="テキストのタイトル"
            className="min-w-0 flex-1 rounded-lg border border-[#3a5a9c] bg-white px-3 py-1.5 text-2xl font-bold text-[#1f2f52] outline-none"
          />
          <button
            type="submit"
            aria-label="タイトルを確定"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3a5a9c] text-white transition-colors hover:bg-[#1f2f52]"
          >
            <Check className="size-4" aria-hidden="true" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-[#1f2f52]">{title}</h1>
          <button
            type="button"
            onClick={startEdit}
            aria-label="タイトルを編集"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#3a5a9c] transition-colors hover:bg-[#d5e0f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c]"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  )
}
