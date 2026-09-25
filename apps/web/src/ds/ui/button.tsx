import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'pressable inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[1.15em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-e1',
        secondary: 'bg-surface text-fg border border-line-strong hover:bg-sunken',
        tint: 'bg-primary-tint text-primary hover:brightness-95 dark:hover:brightness-125',
        ghost: 'text-fg hover:bg-sunken',
        quiet: 'text-muted hover:text-fg hover:bg-sunken',
        danger: 'bg-critical text-white hover:brightness-110 dark:text-[#0f1419]',
        success: 'bg-verified text-white hover:brightness-110 dark:text-[#0f1419]',
        link: 'text-primary underline-offset-4 hover:underline px-0 h-auto shadow-none',
      },
      size: {
        xs: 'h-7 px-2.5 text-micro rounded-sm',
        sm: 'h-8 px-3 text-meta rounded-lg min-h-8 max-md:h-10 max-md:px-3.5',
        md: 'h-ctl px-4 text-body rounded-lg',
        lg: 'h-12 px-5 text-[17px] rounded-xl',
        xl: 'h-14 px-6 text-[17px] rounded-xl',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, loading, icon, iconRight, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size, block }), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  )
})

interface ButtonLinkProps extends LinkProps, ButtonVariantProps {
  icon?: ReactNode
  iconRight?: ReactNode
}

export function ButtonLink({ className, variant, size, block, icon, iconRight, children, viewTransition = true, ...props }: ButtonLinkProps) {
  return (
    <Link viewTransition={viewTransition} className={cn(buttonVariants({ variant, size, block }), className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}

const iconButtonVariants = cva(
  'pressable inline-flex items-center justify-center rounded-full transition-colors select-none disabled:opacity-45 disabled:pointer-events-none [&_svg]:size-5 relative shrink-0',
  {
    variants: {
      variant: {
        ghost: 'text-fg hover:bg-sunken',
        quiet: 'text-muted hover:text-fg hover:bg-sunken',
        outline: 'border border-line bg-surface text-fg hover:bg-sunken',
        tint: 'bg-primary-tint text-primary',
        primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-e2',
      },
      size: {
        sm: 'size-8 [&_svg]:size-4 max-md:size-10',
        md: 'size-10',
        lg: 'size-12 [&_svg]:size-6',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
)

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  label: string
  badge?: number | boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, variant, size, label, badge, children, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cn(iconButtonVariants({ variant, size }), className)} {...props}>
      {children}
      {badge ? (
        typeof badge === 'number' ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-critical text-white text-[10px] font-semibold leading-[18px] text-center ring-2 ring-surface dark:text-[#0f1419]">
            {badge}
          </span>
        ) : (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-critical ring-2 ring-surface" />
        )
      ) : null}
    </button>
  )
})
