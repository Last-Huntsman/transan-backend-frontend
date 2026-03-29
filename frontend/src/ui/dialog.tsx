import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-white/10 dark:bg-[#091014]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <DialogPrimitive.Title className="text-xl font-semibold text-slate-950 dark:text-white">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button aria-label="Закрыть" size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
