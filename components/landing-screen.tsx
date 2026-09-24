"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, ArrowRight, CheckCircle2, Quote, Eye, Smile, Zap, BookmarkPlus } from "lucide-react"
import { extractKeywordSegments } from "@/lib/textProcessing"

const DEMO_SENTENCE = "長文暗記のコツは、全体をざっくり理解すること。そして、覚えた実感を少しずつ積み重ねていくことです。"

type DemoMode = "memorize" | "cloze" | "keyword"

const FEATURES: { icon: typeof Eye; iconBg: string; iconColor: string; title: string; description: string }[] = [
  {
    icon: Eye,
    iconBg: "#d5e0f2",
    iconColor: "#3a5a9c",
    title: "3つの見せ方",
    description: "暗記・穴埋め・キーワードを切り替えて、飽きずに続けられる。自分に合った負荷で無理なく定着。",
  },
  {
    icon: Smile,
    iconBg: "#dcf0e6",
    iconColor: "#2e9e6b",
    title: "進み具合は自己申告",
    description: "未着手・暗記中・習得済みを自分の感覚で決められる。誰かと比べる必要はない。",
  },
  {
    icon: Zap,
    iconBg: "#e4e7ee",
    iconColor: "#6b7690",
    title: "登録不要・ずっと無料",
    description: "アカウント作成なし、ブラウザだけで今すぐ始められる。",
  },
]

const METRICS = [
  { value: "100", unit: "%", label: "ローカル保存" },
  { value: "0", unit: "秒", label: "会員登録・ログイン" },
  { value: "3", unit: "段階", label: "習得状況の自己申告" },
]

export function LandingScreen() {
  const [mode, setMode] = useState<DemoMode>("memorize")
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  const segments = useMemo(() => extractKeywordSegments(DEMO_SENTENCE), [])
  const keywords = segments.filter((s) => s.isKeyword && s.text.trim())

  const today = new Date()
  const dateLabel = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`

  return (
    <main className="min-h-dvh bg-[#e7edf7] text-[#1f2f52]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="mb-6 flex items-center gap-2 sm:mb-10">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1f2f52]">
            <BookOpen className="size-[18px] text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-wide">暗記ノート</span>
        </header>

        <div className="flex flex-col gap-6 sm:gap-10">
          {/* Hero */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
              <div className="flex flex-col items-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d5e0f2] px-3 py-1 text-xs font-semibold text-[#1f2f52]">
                  <BookOpen className="size-4" aria-hidden="true" />
                  長文暗記特化
                </span>
                <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  どんな文章を覚えますか？
                </h1>
                <p className="mt-3 leading-relaxed text-[#3a5a9c]">
                  長い文章をそのまま貼り付けるだけ。少しずつ、確実に。
                </p>

                <div className="mt-4 w-full rounded-lg bg-[#eef2fa] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#3a5a9c]">
                    <Quote className="size-4" aria-hidden="true" />
                    貼り付けサンプル：スピーチ・語学スクリプト・業務テキスト等
                  </div>
                  <p className="pl-1 text-sm italic leading-relaxed text-[#3a5a9c]">
                    「われわれが直面している課題は決して小さなものではありませんが、一歩ずつ着実に積み重ねていくことで、必ず道は開かれます…」
                  </p>
                </div>

                <Link
                  href="/app"
                  className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1f2f52] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#3a5a9c] sm:w-auto"
                >
                  はじめる
                  <ArrowRight className="size-[18px]" aria-hidden="true" />
                </Link>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#3a5a9c]">
                  <CheckCircle2 className="size-4 text-[#2e9e6b]" aria-hidden="true" />
                  アカウント登録不要・ずっと無料（ブラウザ完結）
                </div>
              </div>

              <div className="rounded-2xl bg-[#dde6f5] p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#cddaf0] p-1">
                  <DemoTab active={mode === "memorize"} onClick={() => setMode("memorize")}>
                    暗記モード
                  </DemoTab>
                  <DemoTab active={mode === "cloze"} onClick={() => setMode("cloze")}>
                    穴埋めモード
                  </DemoTab>
                  <DemoTab active={mode === "keyword"} onClick={() => setMode("keyword")}>
                    キーワード抽出
                  </DemoTab>
                </div>

                <div className="mt-3 min-h-[150px] rounded-lg bg-white p-4 shadow-sm">
                  {mode === "memorize" && (
                    <p className="text-base leading-loose">{DEMO_SENTENCE}</p>
                  )}
                  {mode === "cloze" && (
                    <p className="text-base leading-loose">
                      {segments.map((seg, i) => {
                        if (!seg.isKeyword || !seg.text.trim()) return <span key={i}>{seg.text}</span>
                        const isRevealed = revealed[i]
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                            className={`mx-0.5 inline-flex min-w-8 items-center justify-center rounded-md px-1 align-baseline text-sm font-semibold transition-colors ${
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
                  )}
                  {mode === "keyword" && (
                    <ul className="flex flex-wrap gap-2">
                      {keywords.map((kw, i) => (
                        <li key={i} className="rounded-full bg-[#1f2f52] px-3 py-1 text-sm font-medium text-white">
                          {kw.text}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 flex items-center gap-1 text-xs text-[#3a5a9c]">
                    <BookOpen className="size-[15px]" aria-hidden="true" />
                    ワンタップで次の段落へ進めます
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tagline */}
          <section className="rounded-2xl bg-[#dde6f5] p-5 text-center sm:p-10">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#3a5a9c]">
                PROGRESS OVER PERFECTION
              </span>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-[28px]">
                覚えられない日があっても、前には進める。
              </h2>
              <p className="mt-3 leading-relaxed text-[#3a5a9c]">
                「暗記した」と自分で思えたときだけ、次に進む。誰かと比べる必要はない、自分のペースの暗記ノート。
              </p>

              <div className="mt-8 grid w-full grid-cols-3 gap-2 border-t border-[#c4d2ea] pt-6">
                {METRICS.map((m) => (
                  <div key={m.label} className="flex flex-col items-center">
                    <span className="text-xl font-bold sm:text-2xl">
                      {m.value}
                      <span className="text-sm font-semibold text-[#3a5a9c]">{m.unit}</span>
                    </span>
                    <span className="mt-1 text-xs text-[#3a5a9c]">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3a5a9c]">Features</span>
            <h3 className="mt-1 text-xl font-bold">集中を途切れさせない、3つの安心設計</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div
                    className="flex size-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: f.iconBg, color: f.iconColor }}
                  >
                    <f.icon className="size-6" aria-hidden="true" />
                  </div>
                  <h4 className="mt-4 font-bold">{f.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#3a5a9c]">{f.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="flex flex-col items-center gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <div className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-[#d5e0f2] text-[#3a5a9c] sm:flex">
                <BookmarkPlus className="size-6" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-bold">まずは短文やスピーチの1段落から試してみませんか？</h4>
                <p className="mt-1 text-sm text-[#3a5a9c]">登録なしでいつでも文章の追加・編集ができます。</p>
              </div>
            </div>
            <Link
              href="/app"
              className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#1f2f52] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#3a5a9c] sm:w-auto"
            >
              今すぐ文章を貼り付ける
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
          </section>
        </div>

        <footer className="mt-8 flex items-center justify-between border-t border-[#c4d2ea] pt-4 text-xs text-[#8a97b8] sm:mt-12">
          <span>今日: {dateLabel}</span>
          <span>© {today.getFullYear()} 暗記ノート</span>
        </footer>
      </div>
    </main>
  )
}

function DemoTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-white text-[#1f2f52] shadow-sm" : "text-[#1f2f52]/70"
      }`}
    >
      {children}
    </button>
  )
}
