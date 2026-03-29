import * as Label from '@radix-ui/react-label'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Label.Root className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      {children}
    </Label.Root>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}
