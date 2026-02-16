function createValidationError (message) {
  const error = new Error(message)
  error.category = 'VALIDATION'
  return error
}

export function parseEvent (event) {
  if (!event?.body) {
    throw createValidationError('Event body is missing')
  }

  if (typeof event.body === 'string') {
    try {
      return JSON.parse(event.body)
    } catch (err) {
      throw createValidationError(`Event body is not valid JSON: ${err.message}`)
    }
  }

  return event.body
}
