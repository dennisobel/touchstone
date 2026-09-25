import { Dialog, DropdownMenu, Popover as RPopover, Tooltip } from 'radix-ui'
import { X } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { Toaster as Sonner } from 'sonner'
import { Drawer } from 'vaul'
import { cn } from '@/lib/cn'
import { useIsDesktop } from '@/lib/hooks'
import { IconButton } from './button'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Desktop presentation. Phones always get a bottom sheet. */
  desktop?: 'side' | 'center'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  headerExtra?: ReactNode
  bodyClassName?: string
}

const sideWidths = { sm: 'w-[380px]', md: 'w-[480px]', lg: 'w-[640px]', xl: 'w-[880px]' }
const centerWidths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

/**
 * One overlay for every detail view: a draggable bottom sheet on phones (native feel),
 * a side sheet or centred dialog from 768 px.
 */
export function Sheet({ open, onOpenChange, title, description, children, footer, desktop = 'side', size = 'md', headerExtra, bodyClassName }: SheetProps) {
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-scrim" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-xl border-t border-line bg-surface shadow-e3 outline-none">
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-strong/50" aria-hidden />
            <div className="flex items-start gap-3 px-4 pt-3 pb-3">
              <div className="min-w-0 flex-1">
                <Drawer.Title className="text-h2 font-semibold text-fg">{title}</Drawer.Title>
                {description ? <Drawer.Description className="mt-0.5 text-meta text-muted">{description}</Drawer.Description> : <Drawer.Description className="sr-only">{typeof title === 'string' ? title : 'Details'}</Drawer.Description>}
              </div>
              {headerExtra}
            </div>
            <div className={cn('scroll-touch min-h-0 flex-1 overflow-y-auto px-4 pb-4', !footer && 'pb-[calc(16px+var(--safe-bottom))]', bodyClassName)}>{children}</div>
            {footer && <div className="border-t border-line bg-surface px-4 pt-3 pb-[calc(12px+var(--safe-bottom))]">{footer}</div>}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed z-50 flex flex-col bg-surface shadow-e3 outline-none border border-line',
            desktop === 'side'
              ? cn('inset-y-3 right-3 max-w-[calc(100vw-24px)] rounded-xl animate-[slide-in-right_220ms_var(--ease-out-soft)_both]', sideWidths[size])
              : cn('left-1/2 top-1/2 max-h-[88dvh] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl animate-rise-in', centerWidths[size]),
          )}
        >
          <div className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-h2 font-semibold text-fg">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-0.5 text-meta text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{typeof title === 'string' ? title : 'Details'}</Dialog.Description>}
            </div>
            {headerExtra}
            <Dialog.Close asChild>
              <IconButton label="Close" size="sm" variant="quiet">
                <X />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={cn('scroll-touch min-h-0 flex-1 overflow-y-auto px-5 py-4', bodyClassName)}>{children}</div>
          {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export interface MenuItemDef {
  label: ReactNode
  icon?: ReactNode
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
  separatorBefore?: boolean
  shortcut?: string
}

export function Menu({ trigger, items, align = 'end', label }: { trigger: ReactNode; items: MenuItemDef[]; align?: 'start' | 'end' | 'center'; label?: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          aria-label={label}
          className="z-50 min-w-52 rounded-lg border border-line bg-raised p-1 shadow-e2 animate-fade-in"
        >
          {items.map((it, i) => (
            <Fragment key={i}>
              {it.separatorBefore && <DropdownMenu.Separator className="my-1 h-px bg-line" />}
              <DropdownMenu.Item
                disabled={it.disabled}
                onSelect={it.onSelect}
                className={cn(
                  'flex h-10 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-meta outline-none data-[highlighted]:bg-sunken data-[disabled]:opacity-45 md:h-8 [&_svg]:size-4',
                  it.danger ? 'text-critical' : 'text-fg',
                )}
              >
                {it.icon && <span className="text-muted">{it.icon}</span>}
                <span className="flex-1">{it.label}</span>
                {it.shortcut && <span className="font-mono text-[11px] text-muted">{it.shortcut}</span>}
              </DropdownMenu.Item>
            </Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export const TooltipProvider = Tooltip.Provider

export function Tip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip.Root delayDuration={250}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={6} className="z-[60] max-w-72 rounded-sm bg-fg px-2.5 py-1.5 text-micro text-canvas shadow-e2 animate-fade-in">
          {content}
          <Tooltip.Arrow className="fill-fg" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function Popover({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  className,
  open,
  onOpenChange,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  open?: boolean
  onOpenChange?: (v: boolean) => void
}) {
  return (
    <RPopover.Root open={open} onOpenChange={onOpenChange}>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content
          align={align}
          side={side}
          sideOffset={8}
          collisionPadding={12}
          className={cn('z-50 w-80 max-w-[calc(100vw-24px)] rounded-lg border border-line bg-raised p-4 shadow-e2 outline-none animate-fade-in', className)}
        >
          {children}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  )
}

export function Toaster() {
  const isDesktop = useIsDesktop()
  return (
    <Sonner
      position={isDesktop ? 'bottom-right' : 'top-center'}
      offset={isDesktop ? 16 : 'calc(12px + env(safe-area-inset-top))'}
      toastOptions={{
        classNames: {
          toast: '!rounded-lg !border !border-line !bg-raised !text-fg !shadow-e3 !font-sans',
          description: '!text-muted',
          actionButton: '!bg-primary !text-on-primary',
        },
      }}
    />
  )
}
