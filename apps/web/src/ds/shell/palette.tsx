import { Dialog } from 'radix-ui'
import { CornerDownLeft, FlaskConical, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { useHotkeys, useIsDesktop } from '@/lib/hooks'
import { useDemoStatesStore, useStateParam } from '@/lib/demo-states'
import { useDemo } from '@/lib/store'
import { Kbd, Popover, Sheet } from '../ui'

export interface Command {
  id: string
  label: string
  group: string
  hint?: string
  icon?: ReactNode
  to?: string
  run?: () => void
  keywords?: string
}

/** Command palette (Ctrl/Cmd+K). Full-screen on phones. */
export function CommandPalette({ open, onOpenChange, commands, placeholder = 'Search or jump to…' }: { open: boolean; onOpenChange: (v: boolean) => void; commands: Command[]; placeholder?: string }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return commands
    return commands.filter((c) => `${c.label} ${c.group} ${c.keywords ?? ''} ${c.hint ?? ''}`.toLowerCase().includes(t))
  }, [q, commands])

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
    }
  }, [open])
  useEffect(() => setIdx(0), [q])

  const exec = (c: Command) => {
    onOpenChange(false)
    if (c.run) c.run()
    else if (c.to) navigate(c.to, { viewTransition: true })
  }

  const groups = results.reduce<Record<string, Command[]>>((acc, c) => {
    ;(acc[c.group] ??= []).push(c)
    return acc
  }, {})
  let i = -1

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-raised pt-safe outline-none md:inset-auto md:left-1/2 md:top-[12vh] md:max-h-[70vh] md:w-[640px] md:-translate-x-1/2 md:rounded-xl md:border md:border-line md:pt-0 md:shadow-e3 animate-rise-in"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setIdx((v) => Math.min(results.length - 1, v + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setIdx((v) => Math.max(0, v - 1))
            } else if (e.key === 'Enter' && results[idx]) {
              e.preventDefault()
              exec(results[idx])
            }
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Search className="size-5 text-muted" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="h-14 flex-1 bg-transparent text-body outline-none placeholder:text-muted"
              role="combobox"
              aria-expanded
              aria-controls="palette-list"
              aria-activedescendant={results[idx] ? `cmd-${results[idx].id}` : undefined}
            />
            <Dialog.Close className="rounded-full p-2 text-muted hover:bg-sunken md:hidden" aria-label="Close">
              <X className="size-5" />
            </Dialog.Close>
            <Kbd className="hidden md:inline-flex">Esc</Kbd>
          </div>
          <div ref={listRef} id="palette-list" role="listbox" className="scroll-touch min-h-0 flex-1 overflow-y-auto p-2">
            {results.length === 0 && <p className="px-3 py-8 text-center text-meta text-muted">No matches for “{q}”.</p>}
            {Object.entries(groups).map(([g, cs]) => (
              <div key={g} className="mb-2">
                <p className="px-3 pb-1 pt-2 text-micro font-semibold uppercase tracking-wide text-muted">{g}</p>
                {cs.map((c) => {
                  i++
                  const my = i
                  return (
                    <button
                      key={c.id}
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={my === idx}
                      onMouseMove={() => setIdx(my)}
                      onClick={() => exec(c)}
                      className={cn('flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-left text-meta md:min-h-9', my === idx ? 'bg-primary-tint text-fg' : 'text-fg')}
                    >
                      <span className="text-muted [&_svg]:size-4">{c.icon}</span>
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && <span className="truncate text-micro text-muted">{c.hint}</span>}
                      {my === idx && <CornerDownLeft className="hidden size-3.5 text-muted md:block" aria-hidden />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="hidden items-center gap-3 border-t border-line px-4 py-2 text-micro text-muted md:flex">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> move
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>Enter</Kbd> open
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Keyboard shortcut help overlay, opened with "?" */
export function ShortcutsOverlay({ shortcuts }: { shortcuts: { keys: string[]; label: string }[] }) {
  const [open, setOpen] = useState(false)
  useHotkeys({ 'shift+?': () => setOpen(true) })
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Keyboard shortcuts" desktop="center" size="sm">
      <ul className="divide-y divide-line">
        {shortcuts.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 py-2.5 text-meta">
            <span className="text-fg">{s.label}</span>
            <span className="flex gap-1">
              {s.keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

/** Floating demo control listing the current screen's designed states (empty, offline, error…). */
export function StatesControl() {
  const options = useDemoStatesStore((s) => s.options)
  const show = useDemo((s) => s.showDemoControls)
  const [raw, setRaw] = useStateParam()
  const [open, setOpen] = useState(false)
  const isDesktop = useIsDesktop()
  if (!show || options.length < 2) return null
  const current = options.find((o) => o.id === raw) ?? options[0]
  return (
    <div
      // Phones: a small tab on the left edge so it never covers primary actions. Desktop: bottom-right pill.
      className="no-print fixed left-0 top-[45%] z-40 md:left-auto md:top-auto md:bottom-4 md:right-4"
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        side={isDesktop ? 'top' : 'right'}
        className="w-64 p-2"
        trigger={
          <button
            type="button"
            className="pressable inline-flex h-10 items-center gap-2 rounded-r-full border border-l-0 border-dashed border-brand/60 bg-raised/95 pl-2 pr-2.5 text-micro font-medium text-fg shadow-e3 backdrop-blur md:rounded-full md:border-l md:pl-3 md:pr-4"
            aria-label={`Screen state: ${current.label}. Change state`}
          >
            <FlaskConical className="size-4 text-brand" aria-hidden />
            <span className="text-muted max-md:hidden">State</span>
            <span className="max-w-32 truncate max-md:hidden">{current.label}</span>
          </button>
        }
      >
        <p className="px-2 pb-1.5 pt-1 text-micro font-semibold uppercase tracking-wide text-muted">Designed states (demo)</p>
        <div role="listbox" aria-label="Screen states">
          {options.map((o, i) => (
            <button
              key={o.id}
              role="option"
              aria-selected={o.id === current.id}
              onClick={() => {
                setRaw(i === 0 ? null : o.id)
                setOpen(false)
              }}
              className={cn('flex min-h-10 w-full items-center rounded-sm px-2 text-left text-meta md:min-h-8', o.id === current.id ? 'bg-primary-tint font-medium text-primary' : 'text-fg hover:bg-sunken')}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  )
}

