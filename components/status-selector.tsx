"use client"

import type { ChunkStatus } from "@/lib/types"

const STATUSES: { value: ChunkStatus; label: string; dot: string; activeBg: string }[] = [
  { value: "new", label: "未着手", dot: "bg-[#9aa9c6]", activeBg: "bg-[#9aa9c6]" },
  { value: "learning", label: "暗記中", dot: "bg-[#3a5a9c]", activeBg: "bg-[#3a5a9c]" },
  { value: "mastered", label: "習得済み", dot: "bg-[#2e9e6b]", activeBg: "bg-[#2e9e6b]" },
]

type StatusSelectorProps = {
  value: ChunkStatus
  onChange: (status: ChunkStatus) => void
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="このブロックの習得状況">
      {STATUSES.map((status) => {
        const active = status.value === value
        return (
          <button
            key={status.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(status.value)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c] ${
              active
                ? `${status.activeBg} text-white shadow-sm`
                : "bg-white text-[#1f2f52] ring-1 ring-[#cdd9ef] hover:bg-[#d5e0f2]"
            }`}
          >
            <span className={`size-2.5 rounded-full ${active ? "bg-white" : status.dot}`} aria-hidden="true" />
            {status.label}
          </button>
        )
      })}
    </div>
  )
}
