import { z } from 'zod'

export const authResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  expires_in: z.number().optional(),
})

export const registrationResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
})

export type Spending = {
  id: string
  sum: number
  date: string
  bank_category: string
  bank_description: string
  currency: string
  category_name: string
  category_description?: string
  comment: string
  created_at?: string | null
  updated_at?: string | null
}

const nullableString = z.string().nullable().optional().transform((value) => value ?? '')

export const backendSpendingSchema = z.object({
  id: z.string().nullable().optional(),
  sum: z.number(),
  date: z.string(),
  bank_category: nullableString,
  bank_description: nullableString,
  currency: nullableString,
  category_name: nullableString,
  category_description: nullableString,
  comment: nullableString,
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export const spendingSchema = backendSpendingSchema.transform(
  (spending): Spending => ({
    ...spending,
    id: spending.id ?? fallbackSpendingId(spending.date, spending.sum),
    currency: spending.currency || 'RUB',
    category_description: spending.category_description || undefined,
  }),
)

export const spendingRequestSchema = z.object({
  sum: z.number(),
  date: z.string(),
  bank_category: z.string(),
  bank_description: z.string(),
  currency: z.string(),
  category_name: z.string(),
  category_description: z.string().optional(),
  comment: z.string(),
})

export const spendingDraftRequestSchema = spendingRequestSchema.omit({
  category_description: true,
})
export const spendingDraftSchema = spendingDraftRequestSchema

export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(),
  })
}

export const spendingsPageSchema = paginatedSchema(spendingSchema)
export const backendSpendingsPageSchema = z
  .object({
    content: z.array(spendingSchema),
    page: z.number(),
    size: z.number(),
    total_elements: z.number(),
    total_pages: z.number(),
  })
  .transform((page) => ({
    items: page.content,
    total: page.total_elements,
    page: page.page + 1,
    size: page.size,
    total_pages: page.total_pages,
  }))

export const forecastCategorySchema = z.object({
  category_name: z.string(),
  total_sum: z.number(),
  spendings: z.array(spendingSchema),
})

export const backendForecastPageSchema = z
  .object({
    overall_comment: z.string().nullable().optional(),
    categories: z.array(forecastCategorySchema),
    page: z.number(),
    size: z.number(),
    total_elements: z.number(),
    total_pages: z.number(),
  })
  .transform((page) => ({
    items: page.categories.flatMap((category) => category.spendings),
    categories: page.categories,
    overall_comment: page.overall_comment ?? '',
    total: page.total_elements,
    page: page.page + 1,
    size: page.size,
    total_pages: page.total_pages,
  }))

export const importResponseSchema = z.object({
  imported: z.number(),
  failed: z.number(),
  errors: z.array(z.object({ row: z.number(), reason: z.string() })),
})

export type AuthResponse = z.infer<typeof authResponseSchema>
export type RegistrationResponse = z.infer<typeof registrationResponseSchema>
export type SpendingDraft = z.infer<typeof spendingRequestSchema>
export type SpendingsPage = z.infer<typeof spendingsPageSchema>
export type ForecastPage = z.infer<typeof backendForecastPageSchema>

function fallbackSpendingId(date: string, sum: number) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${date}-${sum}`
}
