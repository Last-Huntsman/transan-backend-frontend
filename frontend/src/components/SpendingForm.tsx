import { useMemo, useState } from 'react'
import type { Spending, SpendingDraft } from '../api/schemas'
import { toInputDate } from '../lib/format'
import { Button } from '../ui/button'
import { Field, Input, Textarea } from '../ui/field'

type SpendingFormValues = SpendingDraft

const emptyValues: SpendingFormValues = {
  sum: 0,
  date: new Date().toISOString().slice(0, 10),
  bank_category: '',
  bank_description: '',
  currency: 'RUB',
  category_name: '',
  comment: '',
}

export function SpendingForm({
  initial,
  isSaving,
  onSubmit,
}: {
  initial?: Spending | null
  isSaving: boolean
  onSubmit: (values: SpendingFormValues) => void
}) {
  const defaults = useMemo<SpendingFormValues>(
    () =>
      initial
        ? {
            sum: initial.sum,
            date: toInputDate(initial.date),
            bank_category: initial.bank_category,
            bank_description: initial.bank_description,
            currency: initial.currency,
            category_name: initial.category_name,
            comment: initial.comment,
          }
        : emptyValues,
    [initial],
  )
  const [values, setValues] = useState(defaults)

  const update = (field: keyof SpendingFormValues, value: string | number) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ ...values, sum: Number(values.sum), date: values.date })
      }}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_160px_140px]">
        <Field label="Сумма">
          <Input
            min="0"
            required
            step="0.01"
            type="number"
            value={values.sum}
            onChange={(event) => update('sum', event.target.value)}
          />
        </Field>
        <Field label="Дата">
          <Input
            required
            type="date"
            value={values.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </Field>
        <Field label="Валюта">
          <Input
            required
            value={values.currency}
            onChange={(event) => update('currency', event.target.value.toUpperCase())}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Категория">
          <Input
            required
            value={values.category_name}
            onChange={(event) => update('category_name', event.target.value)}
          />
        </Field>
        <Field label="Категория банка">
          <Input
            value={values.bank_category}
            onChange={(event) => update('bank_category', event.target.value)}
          />
        </Field>
      </div>

      <Field label="Описание банка">
        <Input
          value={values.bank_description}
          onChange={(event) => update('bank_description', event.target.value)}
        />
      </Field>

      <Field label="Комментарий">
        <Textarea
          value={values.comment}
          onChange={(event) => update('comment', event.target.value)}
        />
      </Field>

      <div className="flex justify-end">
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Сохраняем' : 'Сохранить'}
        </Button>
      </div>
    </form>
  )
}
