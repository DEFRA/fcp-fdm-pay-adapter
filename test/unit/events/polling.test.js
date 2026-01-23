import { vi, describe, beforeEach, test, expect, afterEach } from 'vitest'

const mockLogInfo = vi.fn()
const mockLogError = vi.fn()

vi.mock('../../../src/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: mockLogInfo,
    error: mockLogError
  })
}))

const mockProcessEvent = vi.fn()

vi.mock('../../../src/events/process.js', () => ({
  processEvent: mockProcessEvent
}))

const mockClose = vi.fn()
const mockSubscribe = vi.fn()
const mockCreateReceiver = vi.fn()
const mockServiceBusClient = vi.fn()

vi.mock('@azure/service-bus', () => ({
  ServiceBusClient: mockServiceBusClient
}))

vi.mock('ws', () => ({
  default: vi.fn()
}))

vi.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: vi.fn()
}))

const mockConfig = {
  active: true,
  httpProxy: null,
  azure: {
    serviceBus: {
      host: 'test-servicebus.servicebus.windows.net',
      username: 'test-username',
      password: 'test-password',
      topicName: 'test-topic',
      subscriptionName: 'test-subscription',
      useEmulator: false
    }
  }
}

vi.mock('../../../src/config.js', () => ({
  config: {
    get: (key) => {
      const keys = key.split('.')
      let value = mockConfig
      for (const k of keys) {
        value = value[k]
        if (value === undefined) return undefined
      }
      return value
    }
  }
}))

describe('Polling', () => {
  let pollingModule
  let mockReceiver
  let mockSbClient

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockReceiver = {
      subscribe: mockSubscribe,
      close: mockClose
    }

    mockSbClient = {
      createReceiver: mockCreateReceiver.mockReturnValue(mockReceiver),
      close: vi.fn()
    }

    mockServiceBusClient.mockReturnValue(mockSbClient)
    mockProcessEvent.mockResolvedValue(undefined)

    pollingModule = await import('../../../src/events/polling.js')
  })

  afterEach(() => {
    pollingModule.stopPolling()
  })

  describe('startPolling', () => {
    test('should log when starting polling', () => {
      pollingModule.startPolling()
      expect(mockLogInfo).toHaveBeenCalledWith('Starting event polling')
    })

    test('should not start polling if active flag is false', () => {
      mockConfig.active = false
      vi.resetModules()

      mockLogInfo.mockClear()
      pollingModule.startPolling()

      expect(mockLogInfo).not.toHaveBeenCalled()

      mockConfig.active = true
    })

    test('should call pollForEvents when starting', async () => {
      pollingModule.startPolling()

      // Give it a moment to call pollForEvents
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockServiceBusClient).toHaveBeenCalled()
    })
  })

  describe('stopPolling', () => {
    test('should close receiver when stopping', async () => {
      pollingModule.startPolling()
      await pollingModule.pollForEvents()

      pollingModule.stopPolling()

      expect(mockReceiver.close).toHaveBeenCalled()
    })

    test('should close Service Bus client when stopping', async () => {
      pollingModule.startPolling()
      await pollingModule.pollForEvents()

      pollingModule.stopPolling()

      expect(mockSbClient.close).toHaveBeenCalled()
    })

    test('should log when stopping', async () => {
      pollingModule.startPolling()
      await pollingModule.pollForEvents()

      mockLogInfo.mockClear()
      pollingModule.stopPolling()

      expect(mockLogInfo).toHaveBeenCalledWith('Event polling stopped')
    })

    test('should handle stopping when receiver is null', () => {
      expect(() => pollingModule.stopPolling()).not.toThrow()
    })
  })

  describe('pollForEvents', () => {
    test('should create Service Bus client with connection string', async () => {
      await pollingModule.pollForEvents()

      expect(mockServiceBusClient).toHaveBeenCalledWith(
        expect.stringContaining('Endpoint=sb://test-servicebus.servicebus.windows.net'),
        expect.objectContaining({})
      )
    })

    test('should create Service Bus client with emulator connection string when useEmulator is true', async () => {
      mockConfig.azure.serviceBus.useEmulator = true
      vi.resetModules()
      pollingModule = await import('../../../src/events/polling.js')

      await pollingModule.pollForEvents()

      expect(mockServiceBusClient).toHaveBeenCalledWith(
        expect.stringContaining('UseDevelopmentEmulator=true'),
        expect.objectContaining({})
      )

      mockConfig.azure.serviceBus.useEmulator = false
    })

    test('should create receiver for topic and subscription', async () => {
      await pollingModule.pollForEvents()

      expect(mockCreateReceiver).toHaveBeenCalledWith('test-topic', 'test-subscription')
    })

    test('should subscribe to receiver with message handlers', async () => {
      await pollingModule.pollForEvents()

      expect(mockSubscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          processMessage: expect.any(Function),
          processError: expect.any(Function)
        }),
        expect.objectContaining({
          autoCompleteMessages: false
        })
      )
    })

    test('should process message when received', async () => {
      let processMessageHandler

      mockSubscribe.mockImplementation((handlers) => {
        processMessageHandler = handlers.processMessage
      })

      await pollingModule.pollForEvents()

      const testMessage = {
        body: { id: 'test-id', type: 'uk.gov.defra.ffc.pay.payment.submitted' }
      }

      await processMessageHandler(testMessage)

      expect(mockProcessEvent).toHaveBeenCalledWith(testMessage, mockReceiver)
    })

    test('should log error when processing error occurs', async () => {
      let processErrorHandler

      mockSubscribe.mockImplementation((handlers) => {
        processErrorHandler = handlers.processError
      })

      await pollingModule.pollForEvents()

      const testError = new Error('Test Service Bus error')
      const errorArgs = {
        error: testError
      }

      await processErrorHandler(errorArgs)

      expect(mockLogError).toHaveBeenCalledWith(testError, 'Service Bus error occurred')
    })

    test('should set autoCompleteMessages to false', async () => {
      await pollingModule.pollForEvents()

      expect(mockSubscribe).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          autoCompleteMessages: false
        })
      )
    })
  })
})
