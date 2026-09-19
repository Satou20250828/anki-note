"use client"

export type PracticeMode = "memorize" | "cloze" | "keyword"

const MODES: { value: PracticeMode; label: string }[] = [
  { value: "memorize", label: "暗記" },
  { value: "cloze", label: "穴埋め" },
  { value: "keyword", label: "キーワード" },
]

type ModeTabsProps = {
  active: PracticeMode
  onChange: (mode: PracticeMode) => void
}

export function ModeTabs({ active, onChange }: ModeTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#d5e0f2] p-1" role="tablist" aria-label="練習モードの選択">
      {MODES.map((mode) => {
        const isActive = mode.value === active
        return (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode.value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c] ${
              isActive ? "bg-white text-[#1f2f52] shadow-sm" : "text-[#3a5a9c] hover:text-[#1f2f52]"
            }`}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
