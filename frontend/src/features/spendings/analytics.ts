import type { Spending } from '../../api/schemas'

export type CategoryTotal = {
  name: string
  value: number
}

export type TrendPoint = {
  date: string
  value: number
}

export function sumSpendings(spendings: Spending[]) {
  return spendings.reduce((total, spending) => total + spending.sum, 0)
}

export function categoryTotals(spendings: Spending[]) {
  const totals = spendings.reduce<Record<string, number>>((acc, spending) => {
    const key = spending.category_name || spending.bank_category || 'Без категории'
    acc[key] = (acc[key] ?? 0) + spending.sum
    return acc
  }, {})

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function dateTrend(spendings: Spending[]) {
  const totals = spendings.reduce<Record<string, number>>((acc, spending) => {
    const key = spending.date.slice(0, 10)
    acc[key] = (acc[key] ?? 0) + spending.sum
    return acc
  }, {})

  return Object.entries(totals)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10)
}

export function topCurrency(spendings: Spending[]) {
  return spendings.find((spending) => spending.currency)?.currency ?? 'RUB'
}
