import { Checkbox as RCheckbox, RadioGroup as RRadio, Switch as RSwitch } from 'radix-ui'
import { Check, ChevronDown, Minus } from 'lucide-react'
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const fieldBase =
  'w-full rounded-sm border bg-surface text-fg placeholder:text-muted/70 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0 disabled:opacity-60 disabled:bg-sunken'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; leading?: ReactNode; trailing?: ReactNode }>(
  function Input({ className, invalid, leading, trailing, ...props }, ref) {
    const input = (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldBase, 'h-ctl px-3', invalid ? 'border-critical' : 'border-line-strong', leading && 'pl-10', trailing && 'pr-10', !(leading || trailing) && className)}
        {...props}
      />
    )
    if (!leading && !trailing) return input
    return (
      <div className={cn('relative w-full', className)}>
        {leading && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted [&_svg]:size-4.5">{leading}</span>}
        {input}
        {trailing && <span className="absolute inset-y-0 right-2 flex items-center text-muted">{trailing}</span>}
      </div>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(function Textarea(
  { className, invalid, rows = 3, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, 'px-3 py-2 min-h-20 resize-y leading-relaxed', invalid ? 'border-critical' : 'border-line-strong', className)}
      {...props}
    />
  )
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <div className={cn('relative w-full', className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldBase, 'h-ctl appearance-none pl-3 pr-9', invalid ? 'border-critical' : 'border-line-strong')}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  )
})

export function Label({ children, htmlFor, className, optional }: { children: ReactNode; htmlFor?: string; className?: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-meta font-medium text-fg', className)}>
      {children}
      {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
    </label>
  )
}

/** Label + control + hint + inline error linked to the field (UI PRD §7 validation errors). */
export function Field({
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  className?: string
  children: (props: { id: string; 'aria-describedby'?: string; invalid: boolean }) => ReactNode
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} optional={optional}>
          {label}
        </Label>
      )}
      {children({ id, 'aria-describedby': describedBy, invalid: !!error })}
      {hint && !error && (
        <p id={hintId} className="text-meta text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-meta font-medium text-critical">
          {error}
        </p>
      )}
    </div>
  )
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  id,
  disabled,
  className,
}: {
  checked: boolean | 'indeterminate'
  onCheckedChange?: (v: boolean) => void
  label?: ReactNode
  description?: ReactNode
  id?: string
  disabled?: boolean
  className?: string
}) {
  const auto = useId()
  const cid = id ?? auto
  const box = (
    <RCheckbox.Root
      id={cid}
      checked={checked}
      disabled={disabled}
      onCheckedChange={(v) => onCheckedChange?.(v === true)}
      className="peer mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary text-on-primary disabled:opacity-50"
    >
      <RCheckbox.Indicator>{checked === 'indeterminate' ? <Minus className="size-3.5" strokeWidth={3} /> : <Check className="size-3.5" strokeWidth={3} />}</RCheckbox.Indicator>
    </RCheckbox.Root>
  )
  if (!label) return box
  return (
    <div className={cn('flex items-start gap-3 min-h-target py-1', className)}>
      {box}
      <label htmlFor={cid} className="flex-1 cursor-pointer select-none">
        <span className="block text-body">{label}</span>
        {description && <span className="block text-meta text-muted mt-0.5">{description}</span>}
      </label>
    </div>
  )
}

export function RadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  className,
  variant = 'list',
  name,
}: {
  value: T
  onValueChange: (v: T) => void
  options: { value: T; label: ReactNode; description?: ReactNode; disabled?: boolean }[]
  className?: string
  variant?: 'list' | 'cards'
  name?: string
}) {
  return (
    <RRadio.Root value={value} onValueChange={(v) => onValueChange(v as T)} className={cn(variant === 'cards' ? 'grid gap-2' : 'space-y-1', className)} name={name}>
      {options.map((o) => {
        const id = `${name ?? 'r'}-${o.value}`
        return (
          <label
            key={o.value}
            htmlFor={id}
            className={cn(
              'flex items-start gap-3 cursor-pointer',
              variant === 'cards'
                ? 'rounded-lg border border-line bg-surface p-3.5 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-tint pressable'
                : 'min-h-target py-1.5',
              o.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <RRadio.Item
              id={id}
              value={o.value}
              disabled={o.disabled}
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface data-[state=checked]:border-primary"
            >
              <RRadio.Indicator className="size-2.5 rounded-full bg-primary" />
            </RRadio.Item>
            <span className="flex-1">
              <span className="block text-body font-medium">{o.label}</span>
              {o.description && <span className="block text-meta text-muted mt-0.5">{o.description}</span>}
            </span>
          </label>
        )
      })}
    </RRadio.Root>
  )
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
  className,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  id?: string
  className?: string
}) {
  const auto = useId()
  const sid = id ?? auto
  const sw = (
    <RSwitch.Root
      id={sid}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-line-strong/60 transition-colors data-[state=checked]:bg-primary disabled:opacity-50"
    >
      <RSwitch.Thumb className="block size-6 translate-x-0.5 rounded-full bg-white shadow-e1 transition-transform duration-200 data-[state=checked]:translate-x-[21px]" />
    </RSwitch.Root>
  )
  if (!label) return sw
  return (
    <div className={cn('flex items-center gap-3 min-h-target', className)}>
      <label htmlFor={sid} className="flex-1 cursor-pointer">
        <span className="block text-body">{label}</span>
        {description && <span className="block text-meta text-muted">{description}</span>}
      </label>
      {sw}
    </div>
  )
}
