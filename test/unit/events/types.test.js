import { describe, test, expect } from 'vitest'

import { getEventType } from '../../../src/events/types.js'

describe('getEventType', () => {
  test('should return "payment" for payment event type', () => {
    const result = getEventType('uk.gov.defra.ffc.pay.payment.submitted')
    expect(result).toBe('payment')
  })

  test('should return "payment" for different payment event subtypes', () => {
    const paymentTypes = [
      'uk.gov.defra.ffc.pay.payment.processed',
      'uk.gov.defra.ffc.pay.payment.extracted',
      'uk.gov.defra.ffc.pay.payment.submitted',
      'uk.gov.defra.ffc.pay.payment.approved'
    ]

    paymentTypes.forEach(type => {
      const result = getEventType(type)
      expect(result).toBe('payment')
    })
  })

  test('should return "hold" for hold event type', () => {
    const result = getEventType('uk.gov.defra.ffc.pay.hold.added')
    expect(result).toBe('hold')
  })

  test('should return "hold" for different hold event subtypes', () => {
    const holdTypes = [
      'uk.gov.defra.ffc.pay.hold.added',
      'uk.gov.defra.ffc.pay.hold.removed',
      'uk.gov.defra.ffc.pay.hold.updated'
    ]

    holdTypes.forEach(type => {
      const result = getEventType(type)
      expect(result).toBe('hold')
    })
  })

  test('should return "warning" for warning event type', () => {
    const result = getEventType('uk.gov.defra.ffc.pay.warning.raised')
    expect(result).toBe('warning')
  })

  test('should return "warning" for different warning event subtypes', () => {
    const warningTypes = [
      'uk.gov.defra.ffc.pay.warning.raised',
      'uk.gov.defra.ffc.pay.warning.cleared',
      'uk.gov.defra.ffc.pay.warning.updated'
    ]

    warningTypes.forEach(type => {
      const result = getEventType(type)
      expect(result).toBe('warning')
    })
  })

  test('should return "batch" for batch event type', () => {
    const result = getEventType('uk.gov.defra.ffc.pay.batch.created')
    expect(result).toBe('batch')
  })

  test('should return "batch" for different batch event subtypes', () => {
    const batchTypes = [
      'uk.gov.defra.ffc.pay.batch.created',
      'uk.gov.defra.ffc.pay.batch.completed',
      'uk.gov.defra.ffc.pay.batch.processed'
    ]

    batchTypes.forEach(type => {
      const result = getEventType(type)
      expect(result).toBe('batch')
    })
  })

  test('should throw error with VALIDATION category for unknown event type', () => {
    try {
      getEventType('uk.gov.defra.unknown.event.type')
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Unknown event type: uk.gov.defra.unknown.event.type')
      expect(error.category).toBe('VALIDATION')
    }
  })

  test('should throw error with VALIDATION category for event type without prefix', () => {
    try {
      getEventType('some.random.event')
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Unknown event type: some.random.event')
      expect(error.category).toBe('VALIDATION')
    }
  })

  test('should throw error with VALIDATION category for empty event type', () => {
    try {
      getEventType('')
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Unknown event type: ')
      expect(error.category).toBe('VALIDATION')
    }
  })
})
