import WebSocket from 'ws'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ServiceBusClient } from '@azure/service-bus'
import { createLogger } from '../common/helpers/logging/logger.js'
import { processEvent } from './process.js'
import { config } from '../config.js'

const serviceBusConfig = config.get('azure.serviceBus')

const logger = createLogger()

let sbClient = null
let sbReceiver = null

export function startPolling () {
  if (!config.get('active')) {
    return
  }
  logger.info('Starting event polling')
  pollForEvents()
}

export function stopPolling () {
  if (sbReceiver) {
    sbReceiver.close()
  }

  if (sbClient) {
    sbClient.close()
  }

  logger.info('Event polling stopped')
}

export async function pollForEvents () {
  sbClient = new ServiceBusClient(getConnectionString(), { ...getWebSocketOptions() })
  sbReceiver = sbClient.createReceiver(serviceBusConfig.topicName, serviceBusConfig.subscriptionName)

  sbReceiver.subscribe({
    processMessage: (message) => processEvent(message, sbReceiver),
    processError: async (args) => {
      logger.error(args.error, 'Service Bus error occurred')
    }
  }, {
    autoCompleteMessages: false
  })
}

function getConnectionString () {
  return serviceBusConfig.useEmulator
    ? `Endpoint=sb://${serviceBusConfig.host};SharedAccessKeyName=${serviceBusConfig.username};SharedAccessKey=${serviceBusConfig.password};UseDevelopmentEmulator=true;`
    : `Endpoint=sb://${serviceBusConfig.host}.servicebus.windows.net;SharedAccessKeyName=${serviceBusConfig.username};SharedAccessKey=${serviceBusConfig.password}`
}

function getWebSocketOptions () {
  const proxyUrl = config.get('httpProxy')
  return proxyUrl
    ? {
        webSocket: WebSocket,
        webSocketConstructorOptions: {
          agent: new HttpsProxyAgent(proxyUrl),
        },
      }
    : {}
}
