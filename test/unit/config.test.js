import { expect, test, describe, beforeEach, afterAll, vi } from 'vitest'

describe('config', () => {
  const PROCESS_ENV = process.env

  beforeEach(() => {
    vi.resetModules()

    process.env = { ...PROCESS_ENV }

    process.env.NODE_ENV = 'test'

    process.env.HOST = '1.1.1.1'
    process.env.PORT = '6000'
    process.env.SERVICE_VERSION = '1.0.0'
    process.env.ENVIRONMENT = 'dev'
    process.env.LOG_ENABLED = 'true'
    process.env.LOG_LEVEL = 'debug'
    process.env.LOG_FORMAT = 'ecs'
    process.env.HTTP_PROXY = 'http://proxy:8080'
    process.env.ENABLE_SECURE_CONTEXT = 'true'
    process.env.ENABLE_METRICS = 'true'
    process.env.TRACING_HEADER = 'x-custom-trace-id'
    process.env.ACTIVE = 'true'
    process.env.AWS_REGION = 'eu-west-2'
    process.env.AWS_ENDPOINT_URL = 'http://localstack:4566'
    process.env.AWS_ACCESS_KEY_ID = 'test-key-id'
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'
    process.env.AWS_SNS_TOPIC_ARN = 'arn:aws:sns:eu-west-2:000000000000:test-topic'
    process.env.AZURE_SERVICE_BUS_HOST = 'test-servicebus.servicebus.windows.net'
    process.env.AZURE_SERVICE_BUS_USERNAME = 'test-username'
    process.env.AZURE_SERVICE_BUS_PASSWORD = 'test-password'
    process.env.AZURE_SERVICE_BUS_TOPIC_NAME = 'test-topic'
    process.env.AZURE_SERVICE_BUS_SUBSCRIPTION_NAME = 'test-subscription'
    process.env.AZURE_SERVICE_BUS_EMULATOR = 'false'
  })

  afterAll(() => {
    process.env = { ...PROCESS_ENV }
  })

  test('should return host from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('host')).toBe('1.1.1.1')
  })

  test('should default host to 0.0.0.0 if not provided in environment variable', async () => {
    delete process.env.HOST
    const { config } = await import('../../src/config.js')
    expect(config.get('host')).toBe('0.0.0.0')
  })

  test('should throw error if host is not an IP address', async () => {
    process.env.HOST = 'invalid-ip-address'
    await expect(async () => await import('../../src/config.js')).rejects.toThrow()
  })

  test('should return port from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('port')).toBe(6000)
  })

  test('should default port to 3003 if not provided in environment variable', async () => {
    delete process.env.PORT
    const { config } = await import('../../src/config.js')
    expect(config.get('port')).toBe(3003)
  })

  test('should throw error if port is not a number', async () => {
    process.env.PORT = 'invalid-port'
    await expect(async () => await import('../../src/config.js')).rejects.toThrow()
  })

  test('should throw error if port is not a valid port number', async () => {
    process.env.PORT = '99999'
    await expect(async () => await import('../../src/config.js')).rejects.toThrow()
  })

  test('should return service name with default value', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('serviceName')).toBe('fcp-fdm-pay-adapter')
  })

  test('should return service version from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('serviceVersion')).toBe('1.0.0')
  })

  test('should return null service version if not provided in environment variable', async () => {
    delete process.env.SERVICE_VERSION
    const { config } = await import('../../src/config.js')
    expect(config.get('serviceVersion')).toBeNull()
  })

  test('should return cdp environment from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('cdpEnvironment')).toBe('dev')
  })

  test('should default cdp environment to local if not provided in environment variable', async () => {
    delete process.env.ENVIRONMENT
    const { config } = await import('../../src/config.js')
    expect(config.get('cdpEnvironment')).toBe('local')
  })

  test('should return log enabled from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('log.isEnabled')).toBe(true)
  })

  test('should default log enabled to true for non-test environments', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.LOG_ENABLED
    const { config } = await import('../../src/config.js')
    expect(config.get('log.isEnabled')).toBe(true)
  })

  test('should return log level from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('log.level')).toBe('debug')
  })

  test('should default log level to info if not provided in environment variable', async () => {
    delete process.env.LOG_LEVEL
    const { config } = await import('../../src/config.js')
    expect(config.get('log.level')).toBe('info')
  })

  test('should return log format from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('log.format')).toBe('ecs')
  })

  test('should default log format to pino-pretty for non-production environments', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.LOG_FORMAT
    const { config } = await import('../../src/config.js')
    expect(config.get('log.format')).toBe('pino-pretty')
  })

  test('should return http proxy from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('httpProxy')).toBe('http://proxy:8080')
  })

  test('should return null http proxy if not provided in environment variable', async () => {
    delete process.env.HTTP_PROXY
    const { config } = await import('../../src/config.js')
    expect(config.get('httpProxy')).toBeNull()
  })

  test('should return secure context enabled from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('isSecureContextEnabled')).toBe(true)
  })

  test('should default secure context enabled to false for non-production environments', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.ENABLE_SECURE_CONTEXT
    const { config } = await import('../../src/config.js')
    expect(config.get('isSecureContextEnabled')).toBe(false)
  })

  test('should return metrics enabled from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('isMetricsEnabled')).toBe(true)
  })

  test('should default metrics enabled to false for non-production environments', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.ENABLE_METRICS
    const { config } = await import('../../src/config.js')
    expect(config.get('isMetricsEnabled')).toBe(false)
  })

  test('should return tracing header from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('tracing.header')).toBe('x-custom-trace-id')
  })

  test('should default tracing header to x-cdp-request-id if not provided in environment variable', async () => {
    delete process.env.TRACING_HEADER
    const { config } = await import('../../src/config.js')
    expect(config.get('tracing.header')).toBe('x-cdp-request-id')
  })

  test('should return active flag from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('active')).toBe(true)
  })

  test('should default active flag to true if not provided in environment variable', async () => {
    delete process.env.ACTIVE
    const { config } = await import('../../src/config.js')
    expect(config.get('active')).toBe(true)
  })

  test('should return AWS region from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('aws.region')).toBe('eu-west-2')
  })

  test('should default AWS region to eu-west-2 if not provided in environment variable', async () => {
    delete process.env.AWS_REGION
    const { config } = await import('../../src/config.js')
    expect(config.get('aws.region')).toBe('eu-west-2')
  })

  test('should return AWS endpoint URL from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('aws.endpoint')).toBe('http://localstack:4566')
  })

  test('should default AWS endpoint URL to null if not provided in environment variable', async () => {
    delete process.env.AWS_ENDPOINT_URL
    const { config } = await import('../../src/config.js')
    expect(config.get('aws.endpoint')).toBeNull()
  })

  test('should return AWS SNS topic ARN from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('aws.sns.topicArn')).toBe('arn:aws:sns:eu-west-2:000000000000:test-topic')
  })

  test('should return Azure Service Bus host from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.host')).toBe('test-servicebus.servicebus.windows.net')
  })

  test('should return Azure Service Bus username from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.username')).toBe('test-username')
  })

  test('should return Azure Service Bus password from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.password')).toBe('test-password')
  })

  test('should return Azure Service Bus topic name from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.topicName')).toBe('test-topic')
  })

  test('should return Azure Service Bus subscription name from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.subscriptionName')).toBe('test-subscription')
  })

  test('should default Azure Service Bus subscription name to fcp-fdm if not provided in environment variable', async () => {
    delete process.env.AZURE_SERVICE_BUS_SUBSCRIPTION_NAME
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.subscriptionName')).toBe('fcp-fdm')
  })

  test('should return Azure Service Bus useEmulator flag from environment variable', async () => {
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.useEmulator')).toBe(false)
  })

  test('should default Azure Service Bus useEmulator flag to false if not provided in environment variable', async () => {
    delete process.env.AZURE_SERVICE_BUS_EMULATOR
    const { config } = await import('../../src/config.js')
    expect(config.get('azure.serviceBus.useEmulator')).toBe(false)
  })
})
