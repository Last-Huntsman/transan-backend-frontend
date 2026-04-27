import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Spending } from '../api/schemas'
import {
  createSpending,
  deleteSpending,
  fetchSpendings,
  updateSpending,
} from '../api/spendings'
import { ImportCsvButton } from '../components/ImportCsvButton'
import { SpendingForm } from '../components/SpendingForm'
import { formatDate, formatMoney } from '../lib/format'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { Dialog } from '../ui/dialog'
import { Input } from '../ui/field'
import { ErrorState, LoadingState } from '../ui/status'

const pageSize = 10

export function TransactionsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Spending | null>(null)

  const spendingsQuery = useQuery({
    queryKey: ['spendings', page, pageSize],
    queryFn: () => fetchSpendings({ page, size: pageSize }),
  })

  const createMutation = useMutation({
    mutationFn: createSpending,
    onSuccess: () => {
      closeEditor()
      invalidateSpendings(queryClient)
    },
  })
  const updateMutation = useMutation({
    mutationFn: updateSpending,
    onSuccess: () => {
      closeEditor()
      invalidateSpendings(queryClient)
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteSpending,
    onSuccess: () => invalidateSpendings(queryClient),
  })

  const filtered = useMemo(() => {
    const spendings = spendingsQuery.data?.items ?? []
    const query = search.trim().toLowerCase()

    if (!query) {
      return spendings
    }

    return spendings.filter((spending) =>
      [
        spending.category_name,
        spending.bank_category,
        spending.bank_description,
        spending.comment,
        spending.currency,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [search, spendingsQuery.data?.items])

  const totalPages = Math.max(1, Math.ceil((spendingsQuery.data?.total ?? 0) / pageSize))

  const openCreate = () => {
    setEditing(null)
    setEditorOpen(true)
  }

  const openEdit = (spending: Spending) => {
    setEditing(spending)
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditing(null)
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-normal text-emerald-600 dark:text-emerald-300">
            Ledger
          </div>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">
            Транзакции
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {spendingsQuery.data
              ? `${spendingsQuery.data.total} операций в demo-хранилище`
              : 'Операции пользователя'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportCsvButton />
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </div>
      </section>

      <Card className="rounded-2xl">
        <CardHeader className="items-center">
          <div>
            <CardTitle>Операции</CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Поиск работает по текущей странице
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Поиск по описанию, категории, валюте"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>

        {spendingsQuery.isLoading ? <LoadingState label="Загружаем операции" /> : null}
        {spendingsQuery.isError ? <ErrorState message={spendingsQuery.error.message} /> : null}

        {spendingsQuery.isSuccess ? (
          <div className="data-grid overflow-x-auto">
            <table className="w-full min-w-[880px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-normal text-slate-500 dark:text-slate-400">
                  <th className="border-b border-slate-200 py-3 pr-4 dark:border-white/10">Дата</th>
                  <th className="border-b border-slate-200 py-3 pr-4 dark:border-white/10">Описание</th>
                  <th className="border-b border-slate-200 py-3 pr-4 dark:border-white/10">Категория</th>
                  <th className="border-b border-slate-200 py-3 pr-4 text-right dark:border-white/10">Сумма</th>
                  <th className="border-b border-slate-200 py-3 pl-4 text-right dark:border-white/10">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((spending, index) => (
                  <motion.tr
                    key={spending.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-700 dark:text-slate-200"
                    initial={{ opacity: 0, y: 8 }}
                    transition={{ delay: index * 0.025 }}
                  >
                    <td className="border-b border-slate-100 py-4 pr-4 dark:border-white/5">
                      {formatDate(spending.date)}
                    </td>
                    <td className="max-w-[340px] border-b border-slate-100 py-4 pr-4 dark:border-white/5">
                      <div className="truncate font-semibold text-slate-950 dark:text-white">
                        {spending.bank_description || spending.comment || 'Операция'}
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {spending.comment || 'Без комментария'}
                      </div>
                    </td>
                    <td className="border-b border-slate-100 py-4 pr-4 dark:border-white/5">
                      <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                        {spending.category_name}
                      </span>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {spending.bank_category}
                      </div>
                    </td>
                    <td className="border-b border-slate-100 py-4 pr-4 text-right font-bold text-slate-950 dark:border-white/5 dark:text-white">
                      {formatMoney(spending.sum, spending.currency)}
                    </td>
                    <td className="border-b border-slate-100 py-4 pl-4 dark:border-white/5">
                      <div className="flex justify-end gap-2">
                        <Button
                          aria-label="Редактировать"
                          size="icon"
                          type="button"
                          variant="secondary"
                          onClick={() => openEdit(spending)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label="Удалить"
                          disabled={deleteMutation.isPending}
                          size="icon"
                          type="button"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm('Удалить транзакцию?')) {
                              deleteMutation.mutate(spending.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-lg font-semibold text-slate-950 dark:text-white">
                  Ничего не найдено
                </div>
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Попробуйте другой запрос или добавьте новую операцию.
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Страница {page} из {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              type="button"
              variant="secondary"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Назад
            </Button>
            <Button
              disabled={page >= totalPages}
              type="button"
              variant="secondary"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Вперед
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={editorOpen}
        title={editing ? 'Редактировать транзакцию' : 'Новая транзакция'}
        onOpenChange={setEditorOpen}
      >
        <SpendingForm
          key={editing?.id ?? 'new'}
          initial={editing}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onSubmit={(values) => {
            if (editing) {
              updateMutation.mutate({ ...values, id: editing.id })
              return
            }

            createMutation.mutate(values)
          }}
        />
      </Dialog>
    </div>
  )
}

function invalidateSpendings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['spendings'] })
  queryClient.invalidateQueries({ queryKey: ['forecast'] })
}
