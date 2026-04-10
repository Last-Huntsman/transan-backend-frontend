import { describe, expect, test } from 'bun:test'
import {
  authResponseSchema,
  backendForecastPageSchema,
  backendSpendingsPageSchema,
  registrationResponseSchema,
} from './schemas'

describe('backend contract schemas', () => {
  test('parses login response tokens', () => {
    const response = authResponseSchema.parse({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
    })

    expect(response.access_token).toBe('access')
  })

  test('parses registration response without tokens', () => {
    const response = registrationResponseSchema.parse({
      id: '0194d6fa-2685-7000-8d36-111111111111',
      username: 'demo',
    })

    expect(response.username).toBe('demo')
  })

  test('maps spending page content to frontend page', () => {
    const page = backendSpendingsPageSchema.parse({
      content: [
        {
          id: '0194d6fa-2685-7000-8d36-222222222222',
          sum: 1500,
          date: '2026-04-27',
          bank_category: null,
          bank_description: 'Cafe',
          currency: 'RUB',
          category_name: 'Food',
          category_description: null,
          comment: null,
          created_at: '2026-04-27T12:00:00Z',
          updated_at: '2026-04-27T12:00:00Z',
        },
      ],
      page: 0,
      size: 20,
      total_elements: 1,
      total_pages: 1,
    })

    expect(page.page).toBe(1)
    expect(page.items[0].bank_category).toBe('')
  })

  test('flattens forecast categories for existing UI', () => {
    const page = backendForecastPageSchema.parse({
      overall_comment: 'ok',
      categories: [
        {
          category_name: 'Food',
          total_sum: 1500,
          spendings: [
            {
              id: '0194d6fa-2685-7000-8d36-333333333333',
              sum: 1500,
              date: '2026-05-01',
              bank_category: 'Restaurants',
              bank_description: 'Cafe',
              currency: 'RUB',
              category_name: 'Food',
              category_description: null,
              comment: null,
            },
          ],
        },
      ],
      page: 0,
      size: 20,
      total_elements: 1,
      total_pages: 1,
    })

    expect(page.items).toHaveLength(1)
    expect(page.categories[0].total_sum).toBe(1500)
  })
})
