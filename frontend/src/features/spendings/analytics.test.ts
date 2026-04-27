import { describe, expect, test } from 'bun:test'
import type { Spending } from '../../api/schemas'
import { categoryTotals, dateTrend, sumSpendings, topCurrency } from './analytics'

const spendings: Spending[] = [
  {
    id: '1',
    sum: 1200,
    date: '2026-04-01',
    bank_category: 'food',
    bank_description: 'Market',
    currency: 'RUB',
    category_name: 'Еда',
    comment: '',
  },
  {
    id: '2',
    sum: 300,
    date: '2026-04-01',
    bank_category: 'coffee',
    bank_description: 'Cafe',
    currency: 'RUB',
    category_name: 'Еда',
    comment: '',
  },
  {
    id: '3',
    sum: 700,
    date: '2026-04-02',
    bank_category: 'transport',
    bank_description: 'Metro',
    currency: 'RUB',
    category_name: 'Транспорт',
    comment: '',
  },
]

describe('spending analytics', () => {
  test('sums spendings', () => {
    expect(sumSpendings(spendings)).toBe(2200)
  })

  test('groups categories by user category', () => {
    expect(categoryTotals(spendings)[0]).toEqual({ name: 'Еда', value: 1500 })
  })

  test('groups trend by date', () => {
    expect(dateTrend(spendings)).toEqual([
      { date: '2026-04-01', value: 1500 },
      { date: '2026-04-02', value: 700 },
    ])
  })

  test('selects first available currency', () => {
    expect(topCurrency(spendings)).toBe('RUB')
  })
})
