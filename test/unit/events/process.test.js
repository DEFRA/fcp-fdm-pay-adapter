import { vi, describe, beforeEach, test, expect } from 'vitest'

const mockLoggerInfo = vi.fn()
const mockLoggerWarn = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('../../../src/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError
  })
}))

const mockParseEvent = vi.fn()

vi.mock('../../../src/events/parse.js', () => ({
  parseEvent: mockParseEvent
}))

const mockGetEventType = vi.fn()

vi.mock('../../../src/events/types.js', () => ({
  getEventType: mockGetEventType
}))

const mockValidateEvent = vi.fn()

vi.mock('../../../src/events/validate.js', () => ({
  validateEvent: mockValidateEvent
}))

const mockPublishEvent = vi.fn()

vi.mock('../../../src/events/publish.js', () => ({
  publishEvent: mockPublishEvent
}))

const testEvent = {
  id: 'test-id',
  type: 'uk.gov.defra.ffc.pay.payment.submitted',
  source: 'test-source',
  data: {
    correlationId: 'test-correlation-id',
    schemeId: 1,
    invoiceNumber: 'INV-123',
    frn: 1234567890
  }
}

const testRawEvent = {
  body: testEvent,
  messageId: 'test-message-id'
}

const mockReceiver = {
  completeMessage: vi.fn(),
  deadLetterMessage: vi.fn()
}

describe('processEvent', () => {
  let processEvent

  beforeEach(async () => {
    vi.clearAllMocks()
    mockParseEvent.mockReturnValue(testEvent)
    mockGetEventType.mockReturnValue('payment')
    mockValidateEvent.mockResolvedValue(undefined)
    mockPublishEvent.mockResolvedValue(undefined)
    processEvent = (await import('../../../src/events/process.js')).processEvent
  })

  test('should parse raw event into JSON', async () => {
    await processEvent(testRawEvent, mockReceiver)
    expect(mockParseEvent).toHaveBeenCalledWith(testRawEvent)
  })

  test('should get event type from parsed event', async () => {
    await processEvent(testRawEvent, mockReceiver)
    expect(mockGetEventType).toHaveBeenCalledWith(testEvent.type)
  })

  test('should validate payment event', async () => {
    await processEvent(testRawEvent, mockReceiver)
    expect(mockValidateEvent).toHaveBeenCalledWith(testEvent, 'payment')
  })

  test('should publish payment event', async () => {
    await processEvent(testRawEvent, mockReceiver)
    expect(mockPublishEvent).toHaveBeenCalledWith(testEvent)
  })

  test('should log successful processing of payment event', async () => {
    await processEvent(testRawEvent, mockReceiver)
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      { id: testEvent.id, type: testEvent.type },
      'Event successfully published to FDM'
    )
  })

  test('should complete message after successful processing', async () => {
    await processEvent(testRawEvent, mockReceiver)
    expect(mockReceiver.completeMessage).toHaveBeenCalledWith(testRawEvent)
  })

  test('should skip non-payment event types', async () => {
    mockGetEventType.mockReturnValueOnce('hold')

    await processEvent(testRawEvent, mockReceiver)

    expect(mockValidateEvent).not.toHaveBeenCalled()
    expect(mockPublishEvent).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      { id: testEvent.id, type: testEvent.type },
      'Skipping unsupported event type'
    )
    expect(mockReceiver.completeMessage).toHaveBeenCalledWith(testRawEvent)
  })

  test('should skip warning event types', async () => {
    mockGetEventType.mockReturnValueOnce('warning')

    await processEvent(testRawEvent, mockReceiver)

    expect(mockValidateEvent).not.toHaveBeenCalled()
    expect(mockPublishEvent).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      { id: testEvent.id, type: testEvent.type },
      'Skipping unsupported event type'
    )
  })

  test('should skip batch event types', async () => {
    mockGetEventType.mockReturnValueOnce('batch')

    await processEvent(testRawEvent, mockReceiver)

    expect(mockValidateEvent).not.toHaveBeenCalled()
    expect(mockPublishEvent).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      { id: testEvent.id, type: testEvent.type },
      'Skipping unsupported event type'
    )
  })

  test('should dead letter message if validation fails', async () => {
    const validationError = new Error('Validation failed')
    validationError.category = 'VALIDATION'

    mockValidateEvent.mockRejectedValueOnce(validationError)

    await processEvent(testRawEvent, mockReceiver)

    expect(mockReceiver.deadLetterMessage).toHaveBeenCalledWith(testRawEvent)
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      { err: validationError, messageId: testRawEvent.messageId },
      'Event validation failed, message moved to dead letter queue'
    )
    expect(mockReceiver.completeMessage).not.toHaveBeenCalled()
  })

  test('should dead letter message if parsing throws validation error', async () => {
    const validationError = new Error('Parsing failed')
    validationError.category = 'VALIDATION'

    mockParseEvent.mockImplementationOnce(() => {
      throw validationError
    })

    await processEvent(testRawEvent, mockReceiver)

    expect(mockReceiver.deadLetterMessage).toHaveBeenCalledWith(testRawEvent)
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      { err: validationError, messageId: testRawEvent.messageId },
      'Event validation failed, message moved to dead letter queue'
    )
  })

  test('should dead letter message if getEventType throws validation error', async () => {
    const validationError = new Error('Unknown event type')
    validationError.category = 'VALIDATION'

    mockGetEventType.mockImplementationOnce(() => {
      throw validationError
    })

    await processEvent(testRawEvent, mockReceiver)

    expect(mockReceiver.deadLetterMessage).toHaveBeenCalledWith(testRawEvent)
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      { err: validationError, messageId: testRawEvent.messageId },
      'Event validation failed, message moved to dead letter queue'
    )
  })

  test('should log error and not dead letter message for non-validation errors', async () => {
    const publishError = new Error('Publish failed')

    mockPublishEvent.mockRejectedValueOnce(publishError)

    await processEvent(testRawEvent, mockReceiver)

    expect(mockLoggerError).toHaveBeenCalledWith(publishError, 'Error processing event')
    expect(mockReceiver.deadLetterMessage).not.toHaveBeenCalled()
    expect(mockReceiver.completeMessage).not.toHaveBeenCalled()
  })

  test('should log error and not dead letter message for parsing errors without validation category', async () => {
    const parseError = new Error('Parse failed')

    mockParseEvent.mockImplementationOnce(() => {
      throw parseError
    })

    await processEvent(testRawEvent, mockReceiver)

    expect(mockLoggerError).toHaveBeenCalledWith(parseError, 'Error processing event')
    expect(mockReceiver.deadLetterMessage).not.toHaveBeenCalled()
  })
})
