import { describe, expect, test } from 'bun:test'
import { formatDate, percent, toInputDate } from './format'

describe('format helpers', () => {
  test('keeps invalid dates readable', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  test('converts ISO dates to input value', () => {
    expect(toInputDate('2026-04-27T12:00:00.000Z')).toBe('2026-04-27')
  })

  test('guards percent division by zero', () => {
    expect(percent(10, 0)).toBe(0)
  })

  test('rounds percent values', () => {
    expect(percent(35, 100)).toBe(35)
  })
})
