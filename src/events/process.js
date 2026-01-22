import { createLogger } from '../common/helpers/logging/logger.js'
import { parseEvent } from './parse.js'
import { getEventType } from './types.js'
import { validateEvent } from './validate.js'
import { publishEvent } from './publish.js'

const logger = createLogger()

export async function processEvent (rawEvent, receiver) {
  try {
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

    await receiver.completeMessage(rawEvent)
  } catch (err) {
    if (err.category === 'VALIDATION') {
      await receiver.deadLetterMessage(rawEvent)
      logger.warn({ err, messageId: rawEvent.messageId }, 'Event validation failed, message moved to dead letter queue')
    } else {
      logger.error(err, 'Error processing event')
    }
  }
}
