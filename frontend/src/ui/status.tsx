import { AlertCircle, Loader2 } from 'lucide-react'
import { Card } from './card'

export function LoadingState({ label = 'Загрузка' }: { label?: string }) {
  return (
    <Card className="flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
    </Card>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="flex items-center gap-3 border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
      <AlertCircle className="h-5 w-5" />
      <span className="text-sm font-medium">{message}</span>
    </Card>
  )
}
