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
})
