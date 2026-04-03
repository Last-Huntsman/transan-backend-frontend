import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { importSpendingsCsv } from '../api/spendings'
import { Button } from '../ui/button'

export function ImportCsvButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: importSpendingsCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] })
      queryClient.invalidateQueries({ queryKey: ['forecast'] })
    },
  })

  return (
    <>
      <input
        ref={inputRef}
        accept=".csv,text/csv"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            mutation.mutate(file)
          }
          event.target.value = ''
        }}
      />
      <Button
        disabled={mutation.isPending}
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {mutation.isPending ? 'Импортируем' : 'CSV импорт'}
      </Button>
    </>
  )
}
