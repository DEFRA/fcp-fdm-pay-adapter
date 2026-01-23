import { vi, describe, beforeEach, test, expect } from 'vitest'

const mockSend = vi.fn()
const mockPublishCommand = vi.fn()

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn().mockImplementation(() => ({
    send: mockSend
  })),
  PublishCommand: vi.fn().mockImplementation((params) => {
    mockPublishCommand(params)
    return params
  })
}))

const mockConfig = {
  aws: {
    sns: {
      topicArn: 'arn:aws:sns:eu-west-2:000000000000:test-topic'
    },
    region: 'eu-west-2',
    endpoint: null,
    accessKeyId: null,
    secretAccessKey: null
  }
}

vi.mock('../../../src/config.js', () => ({
  config: {
    get: (key) => {
      const keys = key.split('.')
      let value = mockConfig
      for (const k of keys) {
        value = value[k]
      }
      return value
    }
  }
}))

describe('publishEvent', () => {
  let publishEvent

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({})
    publishEvent = (await import('../../../src/events/publish.js')).publishEvent
  })

  test('should publish event to SNS topic', async () => {
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

    await publishEvent(testEvent)

    expect(mockPublishCommand).toHaveBeenCalledWith({
      Message: JSON.stringify(testEvent),
      TopicArn: 'arn:aws:sns:eu-west-2:000000000000:test-topic'
    })
    expect(mockSend).toHaveBeenCalledWith({
      Message: JSON.stringify(testEvent),
      TopicArn: 'arn:aws:sns:eu-west-2:000000000000:test-topic'
    })
  })

  test('should publish event with all fields', async () => {
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

    await publishEvent(complexEvent)

    expect(mockPublishCommand).toHaveBeenCalledWith({
      Message: JSON.stringify(complexEvent),
      TopicArn: 'arn:aws:sns:eu-west-2:000000000000:test-topic'
    })
  })

  test('should serialize event to JSON string in message', async () => {
    const testEvent = {
      id: 'test-id',
      type: 'uk.gov.defra.ffc.pay.payment.submitted'
    }

    await publishEvent(testEvent)

    const publishCall = mockPublishCommand.mock.calls[0][0]
    expect(publishCall.Message).toBe(JSON.stringify(testEvent))
    expect(typeof publishCall.Message).toBe('string')
  })

  test('should handle SNS client errors', async () => {
    const testEvent = {
      id: 'test-id',
      type: 'uk.gov.defra.ffc.pay.payment.submitted'
    }

    const snsError = new Error('SNS publish failed')
    mockSend.mockRejectedValueOnce(snsError)

    await expect(publishEvent(testEvent)).rejects.toThrow('SNS publish failed')
  })
})
