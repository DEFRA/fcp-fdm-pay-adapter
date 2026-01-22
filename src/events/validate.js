import schema from './schema.js'

export async function validateEvent (event, eventType) {
  const validationResult = schema.validate(event, { abortEarly: false, allowUnknown: true, stripUnknown: true })

  if (validationResult.error) {
    const error = new Error(`Event is invalid, ${validationResult.error.message}`)
    error.category = 'VALIDATION'
    throw error
  }
}
