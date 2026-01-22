import { parseEvent } from './parse.js'
import { getEventType } from './types.js'
import { validateEvent } from './validate.js'
import { publishEvent } from './publish.js'

export async function processEvent (rawEvent) {
  const event = parseEvent(rawEvent)
  const eventType = getEventType(event.type)

  // FDM is currently only interested in events related to payment requests
  if (eventType === 'payment') {
    await validateEvent(event, eventType)
    await publishEvent(event)
  }
}
