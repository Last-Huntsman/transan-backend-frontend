import { z } from 'zod'

export const authResponseSchema = z.object({
  access_token: z.string().min(1),
})

export const spendingSchema = z.object({
  id: z.string(),
  sum: z.number(),
  date: z.string(),
  bank_category: z.string(),
  bank_description: z.string(),
  currency: z.string(),
  category_name: z.string(),
  comment: z.string(),
})

export const spendingDraftSchema = spendingSchema.omit({ id: true })

export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(),
  })
}

export const spendingsPageSchema = paginatedSchema(spendingSchema)

export type AuthResponse = z.infer<typeof authResponseSchema>
export type Spending = z.infer<typeof spendingSchema>
export type SpendingDraft = z.infer<typeof spendingDraftSchema>
export type SpendingsPage = z.infer<typeof spendingsPageSchema>
