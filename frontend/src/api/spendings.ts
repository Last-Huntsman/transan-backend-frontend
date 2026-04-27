import { apiRequest } from './client'
import {
  mockCreateSpending,
  mockDeleteSpending,
  mockFetchForecast,
  mockFetchSpending,
  mockFetchSpendings,
  mockImportSpendingsCsv,
  mockUpdateSpending,
  USE_MOCKS,
} from './mock-service'
import {
  spendingDraftSchema,
  spendingSchema,
  spendingsPageSchema,
  type Spending,
  type SpendingDraft,
} from './schemas'

export type PaginationParams = {
  page: number
  size: number
}

export function fetchSpendings(params: PaginationParams) {
  if (USE_MOCKS) {
    return mockFetchSpendings(params)
  }

  return apiRequest('/spendings', {
    method: 'GET',
    query: params,
    schema: spendingsPageSchema,
  })
}

export function fetchSpending(id: string) {
  if (USE_MOCKS) {
    return mockFetchSpending(id)
  }

  return apiRequest(`/spendings/${id}`, {
    method: 'GET',
    schema: spendingSchema,
  })
}

export function createSpending(spending: SpendingDraft) {
  if (USE_MOCKS) {
    return mockCreateSpending(spendingDraftSchema.parse(spending))
  }

  return apiRequest('/spendings', {
    method: 'POST',
    body: spendingDraftSchema.parse(spending),
    schema: spendingSchema,
  })
}

export function updateSpending(spending: Spending) {
  if (USE_MOCKS) {
    return mockUpdateSpending(spendingSchema.parse(spending))
  }

  return apiRequest(`/spendings/${spending.id}`, {
    method: 'PUT',
    body: spendingSchema.parse(spending),
    schema: spendingSchema,
  })
}

export function deleteSpending(id: string) {
  if (USE_MOCKS) {
    return mockDeleteSpending(id)
  }

  return apiRequest(`/spendings/${id}`, {
    method: 'DELETE',
  })
}

export function importSpendingsCsv(file: File) {
  if (USE_MOCKS) {
    return mockImportSpendingsCsv(file)
  }

  const formData = new FormData()
  formData.append('file', file)

  return apiRequest('/spendings/import', {
    method: 'POST',
    body: formData,
  })
}

export function fetchForecast(params: PaginationParams) {
  if (USE_MOCKS) {
    return mockFetchForecast(params)
  }

  return apiRequest('/spendings/forecast', {
    method: 'GET',
    query: params,
    schema: spendingsPageSchema,
  })
}
