import { createLogger } from '../common/helpers/logging/logger.js'
import { parseEvent } from './parse.js'
import { getEventType } from './types.js'
import { validateEvent } from './validate.js'
import { publishEvent } from './publish.js'

const logger = createLogger()

export async function processEvent (rawEvent) {
  const event = parseEvent(rawEvent)
  const eventType = getEventType(event.type)

  // FDM is currently only interested in events related to payment requests
  if (eventType === 'payment') {
    await validateEvent(event, eventType)
    await publishEvent(event)
    logger.info({ id: event.id, type: event.type }, 'Event successfully published to FDM')
  } else {
    logger.info({ id: event.id, type: event.type }, 'Skipping unsupported event type')
  }
}
