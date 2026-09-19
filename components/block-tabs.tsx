"use client"

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"]

type BlockTabsProps = {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}

export function BlockTabs({ count, activeIndex, onSelect }: BlockTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="ブロックの選択">
      {Array.from({ length: count }).map((_, index) => {
        const active = index === activeIndex
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`ブロック${index + 1}`}
            onClick={() => onSelect(index)}
            className={`inline-flex size-11 items-center justify-center rounded-xl text-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a5a9c] ${
              active
                ? "bg-[#1f2f52] text-white shadow-sm"
                : "bg-white text-[#3a5a9c] ring-1 ring-[#cdd9ef] hover:bg-[#d5e0f2]"
            }`}
          >
            {CIRCLED[index] ?? index + 1}
          </button>
        )
      })}
    </div>
  )
}
