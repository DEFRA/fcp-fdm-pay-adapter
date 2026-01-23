import { describe, test, expect } from 'vitest'

import schema from '../../../src/events/schema.js'

describe('payment schema', () => {
  const validEvent = {
    specversion: '1.0',
    type: 'uk.gov.defra.ffc.pay.payment.submitted',
    source: 'test-source',
    id: '12345678-1234-1234-1234-123456789012',
    time: new Date('2026-01-01T00:00:00.000Z'),
    data: {
      frn: 1234567890,
      correlationId: '12345678-1234-1234-1234-123456789012',
      schemeId: 1,
      invoiceNumber: 'INV-123'
    }
  }

  test('should validate a valid event with frn', () => {
    const result = schema.validate(validEvent)
    expect(result.error).toBeUndefined()
  })

  test('should validate a valid event with sbi', () => {
    const eventWithSbi = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: undefined,
        sbi: 987654321
      }
    }
    const result = schema.validate(eventWithSbi)
    expect(result.error).toBeUndefined()
  })

  test('should validate a valid event with trader', () => {
    const eventWithTrader = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: undefined,
        trader: 'TEST-TRADER-123'
      }
    }
    const result = schema.validate(eventWithTrader)
    expect(result.error).toBeUndefined()
  })

  test('should validate a valid event with vendor', () => {
    const eventWithVendor = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: undefined,
        vendor: 'TEST-VENDOR-456'
      }
    }
    const result = schema.validate(eventWithVendor)
    expect(result.error).toBeUndefined()
  })

  test('should validate event with all customer identifiers', () => {
    const eventWithAllIdentifiers = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: 1234567890,
        sbi: 987654321,
        trader: 'TEST-TRADER-123',
        vendor: 'TEST-VENDOR-456'
      }
    }
    const result = schema.validate(eventWithAllIdentifiers)
    expect(result.error).toBeUndefined()
  })

  test('should fail validation if no customer identifier is provided', () => {
    const eventWithoutIdentifiers = {
      ...validEvent,
      data: {
        correlationId: '12345678-1234-1234-1234-123456789012',
        schemeId: 1,
        invoiceNumber: 'INV-123'
      }
    }
    const result = schema.validate(eventWithoutIdentifiers)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('failed custom validation')
  })

  test('should fail validation if frn, sbi, trader, and vendor are all empty strings', () => {
    const eventWithEmptyIdentifiers = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: '',
        sbi: '',
        trader: '',
        vendor: ''
      }
    }
    const result = schema.validate(eventWithEmptyIdentifiers)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('failed custom validation')
  })

  test('should fail validation if frn, sbi, trader, and vendor are all null', () => {
    const eventWithNullIdentifiers = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: null,
        sbi: null,
        trader: null,
        vendor: null
      }
    }
    const result = schema.validate(eventWithNullIdentifiers)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('failed custom validation')
  })

  test('should fail validation if specversion is missing', () => {
    const eventWithoutSpecversion = {
      ...validEvent,
      specversion: undefined
    }
    const result = schema.validate(eventWithoutSpecversion)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('specversion')
  })

  test('should fail validation if type is missing', () => {
    const eventWithoutType = {
      ...validEvent,
      type: undefined
    }
    const result = schema.validate(eventWithoutType)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('type')
  })

  test('should fail validation if source is missing', () => {
    const eventWithoutSource = {
      ...validEvent,
      source: undefined
    }
    const result = schema.validate(eventWithoutSource)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('source')
  })

  test('should fail validation if id is missing', () => {
    const eventWithoutId = {
      ...validEvent,
      id: undefined
    }
    const result = schema.validate(eventWithoutId)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('id')
  })

  test('should fail validation if id is not a valid UUID', () => {
    const eventWithInvalidId = {
      ...validEvent,
      id: 'not-a-valid-uuid'
    }
    const result = schema.validate(eventWithInvalidId)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('id')
  })

  test('should fail validation if time is missing', () => {
    const eventWithoutTime = {
      ...validEvent,
      time: undefined
    }
    const result = schema.validate(eventWithoutTime)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('time')
  })

  test('should fail validation if data is missing', () => {
    const eventWithoutData = {
      ...validEvent,
      data: undefined
    }
    const result = schema.validate(eventWithoutData)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('data')
  })

  test('should fail validation if correlationId is missing', () => {
    const eventWithoutCorrelationId = {
      ...validEvent,
      data: {
        ...validEvent.data,
        correlationId: undefined
      }
    }
    const result = schema.validate(eventWithoutCorrelationId)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('correlationId')
  })

  test('should fail validation if correlationId is not a valid GUID', () => {
    const eventWithInvalidCorrelationId = {
      ...validEvent,
      data: {
        ...validEvent.data,
        correlationId: 'not-a-valid-guid'
      }
    }
    const result = schema.validate(eventWithInvalidCorrelationId)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('correlationId')
  })

  test('should fail validation if schemeId is missing', () => {
    const eventWithoutSchemeId = {
      ...validEvent,
      data: {
        ...validEvent.data,
        schemeId: undefined
      }
    }
    const result = schema.validate(eventWithoutSchemeId)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('schemeId')
  })

  test('should fail validation if schemeId is not a positive integer', () => {
    const eventWithInvalidSchemeId = {
      ...validEvent,
      data: {
        ...validEvent.data,
        schemeId: -1
      }
    }
    const result = schema.validate(eventWithInvalidSchemeId)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('schemeId')
  })

  test('should fail validation if invoiceNumber is missing', () => {
    const eventWithoutInvoiceNumber = {
      ...validEvent,
      data: {
        ...validEvent.data,
        invoiceNumber: undefined
      }
    }
    const result = schema.validate(eventWithoutInvoiceNumber)
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('invoiceNumber')
  })

  test('should default subject to "None" if not provided', () => {
    const eventWithoutSubject = {
      ...validEvent,
      subject: undefined
    }
    const result = schema.validate(eventWithoutSubject)
    expect(result.value.subject).toBe('None')
  })

  test('should default datacontenttype to "None" if not provided', () => {
    const eventWithoutDataContentType = {
      ...validEvent,
      datacontenttype: undefined
    }
    const result = schema.validate(eventWithoutDataContentType)
    expect(result.value.datacontenttype).toBe('None')
  })

  test('should allow frn to be an empty string', () => {
    const eventWithEmptyFrn = {
      ...validEvent,
      data: {
        ...validEvent.data,
        frn: '',
        sbi: 987654321
      }
    }
    const result = schema.validate(eventWithEmptyFrn)
    expect(result.error).toBeUndefined()
  })

  test('should allow sbi to be an empty string', () => {
    const eventWithEmptySbi = {
      ...validEvent,
      data: {
        ...validEvent.data,
        sbi: ''
      }
    }
    const result = schema.validate(eventWithEmptySbi)
    expect(result.error).toBeUndefined()
  })

  test('should allow trader to be an empty string if other identifier present', () => {
    const eventWithEmptyTrader = {
      ...validEvent,
      data: {
        ...validEvent.data,
        trader: ''
      }
    }
    const result = schema.validate(eventWithEmptyTrader)
    expect(result.error).toBeUndefined()
  })

  test('should allow vendor to be an empty string if other identifier present', () => {
    const eventWithEmptyVendor = {
      ...validEvent,
      data: {
        ...validEvent.data,
        vendor: ''
      }
    }
    const result = schema.validate(eventWithEmptyVendor)
    expect(result.error).toBeUndefined()
  })
})
