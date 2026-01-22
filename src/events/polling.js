import { ServiceBusClient } from '@azure/service-bus'
import { createLogger } from '../common/helpers/logging/logger.js'
import { processEvent } from './process.js'
import { config } from '../config.js'

const serviceBusConfig = config.get('azure.serviceBus')

const logger = createLogger()

let sbClient = null
let sbReceiver = null

function getConnectionString () {
  return serviceBusConfig.useEmulator
    ? `Endpoint=sb://${serviceBusConfig.host};SharedAccessKeyName=${serviceBusConfig.username};SharedAccessKey=${serviceBusConfig.password};UseDevelopmentEmulator=true;`
    : `Endpoint=sb://${serviceBusConfig.host}.servicebus.windows.net;SharedAccessKeyName=${serviceBusConfig.username};SharedAccessKey=${serviceBusConfig.password}`
}

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
  sbClient = new ServiceBusClient(getConnectionString())
  sbReceiver = sbClient.createReceiver(serviceBusConfig.topicName, serviceBusConfig.subscriptionName)

  sbReceiver.subscribe({
    processMessage: processEvent,
    processError: async (args) => {
      logger.error(args.error, 'Unable to process event')
    }
  })
}
