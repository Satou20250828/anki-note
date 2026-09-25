"use client"

import { useEffect, useRef, useState } from "react"
import { X, Star, Pencil, Trash2, Plus, Check } from "lucide-react"
import type { Folder } from "@/lib/types"

const COLORS = {
  main: "#1f2f52",
  accent: "#3a5a9c",
  bg: "#e7edf7",
}

export type ViewFilter = "all" | "bookmark" | "folder"

type MenuDrawerProps = {
  open: boolean
  onClose: () => void
  filter: ViewFilter
  onSelectAll: () => void
  onSelectBookmark: () => void
  folders: Folder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onFoldersChange: (folders: Folder[]) => void
  onDeleteFolder: (id: string) => void
}

export function MenuDrawer({
  open,
  onClose,
  filter,
  onSelectAll,
  onSelectBookmark,
  folders,
  selectedFolderId,
  onSelectFolder,
  onFoldersChange,
  onDeleteFolder,
}: MenuDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  const startEdit = (folder: Folder) => {
    setEditingId(folder.id)
    setDraftName(folder.name)
  }

  const commitEdit = () => {
    if (!editingId) return
    const name = draftName.trim()
    if (name) {
      onFoldersChange(folders.map((f) => (f.id === editingId ? { ...f, name } : f)))
    }
    setEditingId(null)
    setDraftName("")
  }

  const deleteFolder = (id: string) => {
    onDeleteFolder(id)
    if (filter === "folder" && selectedFolderId === id) onSelectAll()
  }

  const addFolder = () => {
    const id = `folder-${Date.now()}`
    const next: Folder = { id, name: "新しいフォルダ" }
    onFoldersChange([...folders, next])
    startEdit(next)
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: COLORS.bg }}
      >
        <div className="flex items-center px-4 pt-4">
          <button
            onClick={onClose}
            aria-label="メニューを閉じる"
            className="grid size-10 place-items-center rounded-full text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: COLORS.main }}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <section className="pt-4">
            <h2 className="mb-3 text-sm font-bold tracking-wide" style={{ color: COLORS.main }}>
              表示フィルタ
            </h2>
            <div className="space-y-1">
              <RadioRow checked={filter === "all"} onClick={onSelectAll} label="すべて" />
              <RadioRow
                checked={filter === "bookmark"}
                onClick={onSelectBookmark}
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4" style={{ color: COLORS.accent }} fill={COLORS.accent} />
                    ブックマークのみ
                  </span>
                }
              />
            </div>
          </section>

          <hr className="my-5 border-t" style={{ borderColor: "#c4d2ea" }} />

          <section>
            <h2 className="mb-3 text-sm font-bold tracking-wide" style={{ color: COLORS.main }}>
              フォルダ
            </h2>
            <div className="space-y-1">
              <RadioRow
                checked={filter === "folder" && selectedFolderId === null}
                onClick={() => onSelectFolder(null)}
                label="未分類"
              />
              {folders.map((folder) => {
                const isEditing = editingId === folder.id
                return (
                  <div key={folder.id} className="group flex items-center gap-2 rounded-lg px-1">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          commitEdit()
                        }}
                        className="flex flex-1 items-center gap-2 py-1"
                      >
                        <input
                          ref={editInputRef}
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing || e.keyCode === 229) return
                            if (e.key === "Enter") commitEdit()
                          }}
                          className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1.5 text-sm outline-none"
                          style={{ borderColor: COLORS.accent, color: COLORS.main }}
                        />
                        <button
                          type="submit"
                          aria-label="名前を確定"
                          className="grid size-8 shrink-0 place-items-center rounded-md text-white"
                          style={{ backgroundColor: COLORS.accent }}
                        >
                          <Check className="size-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <RadioRow
                          className="flex-1"
                          checked={filter === "folder" && selectedFolderId === folder.id}
                          onClick={() => onSelectFolder(folder.id)}
                          label={folder.name}
                        />
                        <div className="flex shrink-0 items-center gap-1">
                          <IconButton aria-label={`${folder.name}を編集`} onClick={() => startEdit(folder)}>
                            <Pencil className="size-4" />
                          </IconButton>
                          <IconButton
                            aria-label={`${folder.name}を削除`}
                            onClick={() => deleteFolder(folder.id)}
                          >
                            <Trash2 className="size-4" />
                          </IconButton>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              <button
                onClick={addFolder}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/60"
                style={{ color: COLORS.accent }}
              >
                <Plus className="size-4" />
                新しいフォルダを作る
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

function RadioRow({
  checked,
  onClick,
  label,
  className = "",
}: {
  checked: boolean
  onClick: () => void
  label: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/60 ${className}`}
      style={{ color: COLORS.main }}
    >
      <span
        className="grid size-5 shrink-0 place-items-center rounded-full border-2"
        style={{ borderColor: checked ? COLORS.accent : "#9aabc9" }}
      >
        {checked && <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS.accent }} />}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

function IconButton({
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  "aria-label": string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md transition-colors hover:bg-white/70"
      style={{ color: COLORS.main }}
    >
      {children}
    </button>
  )
}
