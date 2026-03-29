import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold tracking-normal transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-950/20 hover:-translate-y-0.5 hover:shadow-emerald-500/25',
        secondary:
          'border border-slate-200/80 bg-white/80 text-slate-800 shadow-sm hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-100 dark:hover:bg-white/[0.12]',
        ghost:
          'text-slate-600 hover:bg-slate-900/6 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
        danger:
          'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-950/20 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-5 text-base',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
