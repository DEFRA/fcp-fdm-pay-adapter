import { describe, test, expect, beforeEach, vi } from 'vitest'

const mockSchemaValidate = vi.fn()

vi.mock('../../../src/events/schema.js', () => ({
  default: {
    validate: mockSchemaValidate
  }
}))

let validateEvent

const testEvent = {
  id: 'test-id',
  type: 'uk.gov.defra.ffc.pay.payment.submitted',
  source: 'test-source',
  specversion: '1.0',
  time: '2026-01-01T00:00:00.000Z',
  data: {
    correlationId: 'test-correlation-id',
    schemeId: 1,
    invoiceNumber: 'INV-123',
    frn: 1234567890
  }
}

const testEventType = 'payment'

describe('validateEvent', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSchemaValidate.mockReturnValue({ error: null })
    validateEvent = (await import('../../../src/events/validate.js')).validateEvent
  })

  test('should validate event payload against schema allowing unknown properties', async () => {
    await validateEvent(testEvent, testEventType)
    expect(mockSchemaValidate).toHaveBeenCalledWith(testEvent, { abortEarly: false, allowUnknown: true, stripUnknown: true })
  })

  test('should not throw error if validation passes', async () => {
    await expect(validateEvent(testEvent, testEventType)).resolves.not.toThrow()
  })

  test('should throw error with VALIDATION category if event validation fails', async () => {
    const validationError = new Error('Validation failed')
    mockSchemaValidate.mockReturnValueOnce({ error: validationError })

    try {
      await validateEvent(testEvent, testEventType)
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe(`Event is invalid, ${validationError.message}`)
      expect(error.category).toBe('VALIDATION')
    }
  })

  test('should throw error with detailed validation message', async () => {
    const validationError = new Error('"data.frn" must be a number')
    mockSchemaValidate.mockReturnValueOnce({ error: validationError })

    try {
      await validateEvent(testEvent, testEventType)
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Event is invalid, "data.frn" must be a number')
      expect(error.category).toBe('VALIDATION')
    }
  })

  test('should handle validation error with multiple issues', async () => {
    const validationError = new Error('"data.correlationId" is required. "data.schemeId" is required')
    mockSchemaValidate.mockReturnValueOnce({ error: validationError })

    try {
      await validateEvent(testEvent, testEventType)
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error.message).toBe('Event is invalid, "data.correlationId" is required. "data.schemeId" is required')
      expect(error.category).toBe('VALIDATION')
    }
  })
})
