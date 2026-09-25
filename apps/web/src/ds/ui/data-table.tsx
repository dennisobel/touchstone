import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useIsDesktop } from '@/lib/hooks'
import { Checkbox } from './form'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headClassName?: string
  align?: 'left' | 'right' | 'center'
  /** Hidden below this breakpoint on desktop layouts */
  hideBelow?: 'lg' | 'xl'
  sortValue?: (row: T) => string | number
  width?: string
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  getId: (row: T) => string
  onRowClick?: (row: T) => void
  selectable?: boolean
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  hidden?: string[]
  /** Phone layout: each row as a card. Tables never scroll sideways on phones. */
  mobileCard?: (row: T) => ReactNode
  empty?: ReactNode
  activeId?: string
  caption?: string
  className?: string
  rowClassName?: (row: T) => string | undefined
}

export function DataTable<T>({
  rows,
  columns,
  getId,
  onRowClick,
  selectable,
  selected = [],
  onSelectedChange,
  hidden = [],
  mobileCard,
  empty,
  activeId,
  caption,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const isDesktop = useIsDesktop()
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const visible = columns.filter((c) => !hidden.includes(c.key))

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const out = [...rows].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      return va < vb ? -1 : va > vb ? 1 : 0
    })
    return sort.dir === 'asc' ? out : out.reverse()
  }, [rows, sort, columns])

  if (rows.length === 0 && empty) return <>{empty}</>

  if (!isDesktop && mobileCard) {
    return (
      <ul className={cn('space-y-2', className)} aria-label={caption}>
        {sorted.map((row) => {
          const id = getId(row)
          return (
            <li key={id}>
              <div
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-e1',
                  onRowClick && 'pressable cursor-pointer active:bg-sunken',
                  activeId === id && 'ring-2 ring-primary',
                )}
              >
                {selectable && (
                  <span onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.includes(id)}
                      onCheckedChange={(v) => onSelectedChange?.(v ? [...selected, id] : selected.filter((s) => s !== id))}
                    />
                  </span>
                )}
                <div className="min-w-0 flex-1">{mobileCard(row)}</div>
                {onRowClick && <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  const allSelected = rows.length > 0 && selected.length === rows.length
  const hide = (c: Column<T>) => (c.hideBelow === 'lg' ? 'max-lg:hidden' : c.hideBelow === 'xl' ? 'max-xl:hidden' : '')

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-line bg-surface shadow-e1', className)}>
      <table className="w-full border-collapse text-left text-body">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-line">
            {selectable && (
              <th className="w-10 pl-3" scope="col">
                <Checkbox
                  checked={allSelected ? true : selected.length ? 'indeterminate' : false}
                  onCheckedChange={(v) => onSelectedChange?.(v ? rows.map(getId) : [])}
                />
                <span className="sr-only">Select all</span>
              </th>
            )}
            {visible.map((c) => {
              const active = sort?.key === c.key
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width }}
                  aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cn(
                    'h-9 whitespace-nowrap px-3 text-micro font-medium uppercase tracking-wide text-muted',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    hide(c),
                    c.headClassName,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      className="inline-flex items-center gap-1 uppercase hover:text-fg"
                      onClick={() => setSort(active && sort!.dir === 'asc' ? { key: c.key, dir: 'desc' } : active && sort!.dir === 'desc' ? null : { key: c.key, dir: 'asc' })}
                    >
                      {c.header}
                      {active && (sort!.dir === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const id = getId(row)
            const isSel = selected.includes(id)
            return (
              <tr
                key={id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                aria-selected={selectable ? isSel : undefined}
                className={cn(
                  'h-row border-b border-line/70 last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-sunken/70',
                  isSel && 'bg-primary-tint/60',
                  activeId === id && 'bg-primary-tint shadow-[inset_2px_0_0_var(--primary)]',
                  rowClassName?.(row),
                )}
              >
                {selectable && (
                  <td className="pl-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSel} onCheckedChange={(v) => onSelectedChange?.(v ? [...selected, id] : selected.filter((s) => s !== id))} />
                  </td>
                )}
                {visible.map((c) => (
                  <td
                    key={c.key}
                    className={cn('px-3 py-1.5 align-middle', c.align === 'right' && 'text-right tabular-nums', c.align === 'center' && 'text-center', hide(c), c.className)}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
