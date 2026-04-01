import { describe, expect, test } from 'bun:test'
import {
  mockCreateSpending,
  mockDeleteSpending,
  mockFetchForecast,
  mockFetchSpendings,
  mockLogin,
  mockUpdateSpending,
  resetMockData,
} from './mock-service'

describe('mock service', () => {
  test('accepts non-empty auth credentials', async () => {
    const response = await mockLogin({ username: 'demo', password: 'demo' })
    expect(response.access_token.startsWith('mock-jwt-demo')).toBe(true)
  })

  test('paginates spendings', async () => {
    resetMockData()
    const page = await mockFetchSpendings({ page: 1, size: 5 })
    expect(page.items).toHaveLength(5)
    expect(page.total).toBeGreaterThan(5)
  })

  test('creates updates and deletes spendings', async () => {
    resetMockData()
    const created = await mockCreateSpending({
      sum: 1000,
      date: '2026-04-27',
      bank_category: 'Test',
      bank_description: 'Test payment',
      currency: 'RUB',
      category_name: 'Тест',
      comment: 'Created in test',
    })
    const updated = await mockUpdateSpending({ ...created, sum: 1500 })
    expect(updated.sum).toBe(1500)

    await mockDeleteSpending(created.id)
    const page = await mockFetchSpendings({ page: 1, size: 100 })
    expect(page.items.some((item) => item.id === created.id)).toBe(false)
  })

  test('returns forecast data', async () => {
    resetMockData()
    const forecast = await mockFetchForecast({ page: 1, size: 10 })
    expect(forecast.items.length).toBeGreaterThan(0)
  })
})
