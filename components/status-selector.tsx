"use client"

import { ChevronDown } from "lucide-react"
import type { ChunkStatus } from "@/lib/types"

const STATUSES: { value: ChunkStatus; label: string; dot: string }[] = [
  { value: "new", label: "未着手", dot: "#9aa9c6" },
  { value: "learning", label: "暗記中", dot: "#3a5a9c" },
  { value: "mastered", label: "習得済み", dot: "#2e9e6b" },
]

export const STATUS_LABEL: Record<ChunkStatus, string> = {
  new: "未着手",
  learning: "暗記中",
  mastered: "習得済み",
}

type StatusSelectorProps = {
  value: ChunkStatus
  onChange: (status: ChunkStatus) => void
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  const current = STATUSES.find((s) => s.value === value) ?? STATUSES[0]

  return (
    <div className="relative w-fit">
      <span
        className="pointer-events-none absolute left-3 top-1/2 size-2.5 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: current.dot }}
        aria-hidden="true"
      />
      <select
        aria-label="このテキストの習得状況"
        value={value}
        onChange={(e) => onChange(e.target.value as ChunkStatus)}
        className="cursor-pointer appearance-none rounded-lg border border-[#3a5a9c]/30 bg-white py-2 pl-8 pr-9 text-sm font-semibold text-[#1f2f52] outline-none transition-colors focus-visible:border-[#3a5a9c] focus-visible:ring-2 focus-visible:ring-[#3a5a9c]/30"
      >
        {STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#3a5a9c]"
        aria-hidden="true"
      />
    </div>
  )
}
