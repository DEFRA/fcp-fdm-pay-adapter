const EVENT_TYPE_PREFIX = 'uk.gov.defra.ffc.pay.'
const EVENT_TYPE_MAP = {
  payment: `${EVENT_TYPE_PREFIX}payment.`,
  hold: `${EVENT_TYPE_PREFIX}hold.`,
  warning: `${EVENT_TYPE_PREFIX}warning.`,
  batch: `${EVENT_TYPE_PREFIX}batch.`
}

function createValidationError (message) {
  const error = new Error(message)
  error.category = 'VALIDATION'
  return error
}

function getEventType (type) {
  if (!type) {
    throw createValidationError('Event type is required')
  }

  if (typeof type !== 'string') {
    throw createValidationError('Event type must be a string')
  }

  for (const [eventType, prefix] of Object.entries(EVENT_TYPE_MAP)) {
    if (type.startsWith(prefix)) {
      return eventType
    }
  }

  throw createValidationError(`Unknown event type: ${type}`)
}

export { getEventType }
