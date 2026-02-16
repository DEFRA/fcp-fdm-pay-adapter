import { describe, test, expect } from 'vitest'

import { parseEvent } from '../../../src/events/parse.js'

const testEvent = {
  id: 'test-id',
  type: 'uk.gov.defra.ffc.pay.payment.submitted',
  source: 'test-source',
  specversion: '1.0',
  time: '2026-01-01T00:00:00.000Z',
  data: {
    correlationId: 'test-correlation-id',
    schemeId: 1,
    invoiceNumber: 'INV-123'
  }
}

describe('parseEvent', () => {
  test('should parse event body from Azure Service Bus message', () => {
    const azureMessage = {
      body: testEvent
    }
    const result = parseEvent(azureMessage)
    expect(result).toEqual(testEvent)
  })

  test('should parse complex event with all fields', () => {
    const complexEvent = {
      id: 'test-id-2',
      type: 'uk.gov.defra.ffc.pay.payment.processed',
      source: 'test-source-2',
      specversion: '1.0',
      time: '2026-01-02T00:00:00.000Z',
      subject: 'test-subject',
      datacontenttype: 'application/json',
      data: {
        frn: 1234567890,
        sbi: 987654321,
        correlationId: 'test-correlation-id-2',
        schemeId: 2,
        invoiceNumber: 'INV-456'
      }
    }
    const azureMessage = {
      body: complexEvent
    }
    const result = parseEvent(azureMessage)
    expect(result).toEqual(complexEvent)
  })

  test('should handle event with minimal required fields', () => {
    const minimalEvent = {
      id: 'test-id-3',
      type: 'uk.gov.defra.ffc.pay.payment.submitted',
      source: 'test-source-3'
    }
    const azureMessage = {
      body: minimalEvent
    }
    const result = parseEvent(azureMessage)
    expect(result).toEqual(minimalEvent)
  })

  test('should parse event with empty data object', () => {
    const eventWithEmptyData = {
      id: 'test-id-4',
      type: 'uk.gov.defra.ffc.pay.payment.submitted',
      source: 'test-source-4',
      data: {}
    }
    const azureMessage = {
      body: eventWithEmptyData
    }
    const result = parseEvent(azureMessage)
    expect(result).toEqual(eventWithEmptyData)
  })

  test('should parse event when body is a valid JSON string', () => {
    const azureMessage = {
      body: JSON.stringify(testEvent)
    }
    const result = parseEvent(azureMessage)
    expect(result).toEqual(testEvent)
  })

  test('should parse complex JSON string with nested objects', () => {
    const complexEvent = {
      id: 'test-id-5',
      type: 'uk.gov.defra.ffc.pay.payment.submitted',
      source: 'test-source-5',
      data: {
        nested: {
          deeply: {
            data: 'value'
          }
        }
      }
    }
    const azureMessage = {
      body: JSON.stringify(complexEvent)
    }
    const result = parseEvent(azureMessage)
    expect(result).toEqual(complexEvent)
  })

  test('should throw validation error when event body is missing', () => {
    const azureMessage = {}
    expect(() => parseEvent(azureMessage)).toThrow('Event body is missing')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
      expect(error.message).toBe('Event body is missing')
    }
  })

  test('should throw validation error when event body is null', () => {
    const azureMessage = { body: null }
    expect(() => parseEvent(azureMessage)).toThrow('Event body is missing')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
      expect(error.message).toBe('Event body is missing')
    }
  })

  test('should throw validation error when event body is undefined', () => {
    const azureMessage = { body: undefined }
    expect(() => parseEvent(azureMessage)).toThrow('Event body is missing')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
      expect(error.message).toBe('Event body is missing')
    }
  })

  test('should throw validation error when event body is an empty string', () => {
    const azureMessage = { body: '' }
    expect(() => parseEvent(azureMessage)).toThrow('Event body is missing')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
      expect(error.message).toBe('Event body is missing')
    }
  })

  test('should throw validation error when event body is not valid JSON string', () => {
    const azureMessage = {
      body: 'not valid json'
    }
    expect(() => parseEvent(azureMessage)).toThrow('Event body is not valid JSON')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
      expect(error.message).toContain('Event body is not valid JSON')
    }
  })

  test('should throw validation error when event body is malformed JSON string', () => {
    const azureMessage = {
      body: '{"incomplete": '
    }
    expect(() => parseEvent(azureMessage)).toThrow('Event body is not valid JSON')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
      expect(error.message).toContain('Event body is not valid JSON')
    }
  })

  test('should throw validation error when JSON string has trailing comma', () => {
    const azureMessage = {
      body: '{"key": "value",}'
    }
    expect(() => parseEvent(azureMessage)).toThrow('Event body is not valid JSON')

    try {
      parseEvent(azureMessage)
    } catch (error) {
      expect(error.category).toBe('VALIDATION')
    }
  })

  test('should handle number primitives in body gracefully', () => {
    const azureMessage = { body: 123 }
    const result = parseEvent(azureMessage)
    expect(result).toBe(123)
  })

  test('should handle boolean primitives in body gracefully', () => {
    const azureMessage = { body: true }
    const result = parseEvent(azureMessage)
    expect(result).toBe(true)
  })

  test('should handle array in body gracefully', () => {
    const azureMessage = { body: [1, 2, 3] }
    const result = parseEvent(azureMessage)
    expect(result).toEqual([1, 2, 3])
  })
})
