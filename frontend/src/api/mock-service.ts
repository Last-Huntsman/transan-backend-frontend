import type { AuthCredentials } from './auth'
import {
  importedMockSpendings,
  initialMockForecast,
  initialMockSpendings,
} from './mock-data'
import type { Spending, SpendingDraft, SpendingsPage } from './schemas'
import type { PaginationParams } from './spendings'

const SPENDINGS_KEY = 'transan.mock.spendings'
const FORECAST_KEY = 'transan.mock.forecast'
const viteEnv = (
  import.meta as ImportMeta & { env?: Record<string, string | undefined> }
).env

export const USE_MOCKS = viteEnv?.VITE_USE_MOCKS === 'true'

export async function mockLogin(credentials: AuthCredentials) {
  await wait(260)
  validateCredentials(credentials)
  return { access_token: `mock-jwt-${credentials.username}-${Date.now()}` }
}

export const mockRegister = mockLogin

export async function mockFetchSpendings(params: PaginationParams) {
  await wait(180)
  return paginate(readSpendings(), params)
}

export async function mockFetchSpending(id: string) {
  await wait(120)
  const spending = readSpendings().find((item) => item.id === id)

  if (!spending) {
    throw new Error('Транзакция не найдена')
  }

  return spending
}

export async function mockCreateSpending(spending: SpendingDraft) {
  await wait(160)
  const next: Spending = {
    ...spending,
    id: `sp-${crypto.randomUUID?.() ?? Date.now()}`,
  }
  const spendings = [next, ...readSpendings()]
  writeSpendings(spendings)
  return next
}

export async function mockUpdateSpending(spending: Spending) {
  await wait(160)
  const spendings = readSpendings()
  const index = spendings.findIndex((item) => item.id === spending.id)

  if (index === -1) {
    throw new Error('Транзакция не найдена')
  }

  const next = [...spendings]
  next[index] = spending
  writeSpendings(next)
  return spending
}

export async function mockDeleteSpending(id: string) {
  await wait(120)
  writeSpendings(readSpendings().filter((spending) => spending.id !== id))
}

export async function mockImportSpendingsCsv(file: File) {
  void file
  await wait(420)
  const existing = readSpendings()
  const imported = importedMockSpendings.map((item) => ({
    ...item,
    id: `${item.id}-${Date.now()}`,
  }))
  writeSpendings([...imported, ...existing])
}

export async function mockFetchForecast(params: PaginationParams) {
  await wait(200)
  return paginate(readForecast(), params)
}

export function resetMockData() {
  writeSpendings(initialMockSpendings)
  writeForecast(initialMockForecast)
}

function validateCredentials(credentials: AuthCredentials) {
  if (!credentials.username.trim() || !credentials.password.trim()) {
    throw new Error('Введите логин и пароль')
  }
}

function paginate(items: Spending[], params: PaginationParams): SpendingsPage {
  const page = Math.max(1, params.page)
  const size = Math.max(1, params.size)
  const start = (page - 1) * size

  return {
    items: [...items]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(start, start + size),
    total: items.length,
    page,
    size,
  }
}

function readSpendings() {
  return readCollection(SPENDINGS_KEY, initialMockSpendings)
}

function writeSpendings(spendings: Spending[]) {
  writeCollection(SPENDINGS_KEY, spendings)
}

function readForecast() {
  return readCollection(FORECAST_KEY, initialMockForecast)
}

function writeForecast(forecast: Spending[]) {
  writeCollection(FORECAST_KEY, forecast)
}

function readCollection(key: string, fallback: Spending[]) {
  const raw = getStorage().getItem(key)

  if (!raw) {
    writeCollection(key, fallback)
    return [...fallback]
  }

  try {
    return JSON.parse(raw) as Spending[]
  } catch {
    writeCollection(key, fallback)
    return [...fallback]
  }
}

function writeCollection(key: string, value: Spending[]) {
  getStorage().setItem(key, JSON.stringify(value))
}

const memoryStorage = new Map<string, string>()

function getStorage(): StorageLike {
  if (typeof window !== 'undefined') {
    return window.localStorage
  }

  return {
    getItem: (key) => memoryStorage.get(key) ?? null,
    setItem: (key, value) => memoryStorage.set(key, value),
    removeItem: (key) => memoryStorage.delete(key),
  }
}

type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
