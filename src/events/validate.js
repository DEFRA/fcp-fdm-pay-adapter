import schema from './schema.js'

export async function validateEvent (event, eventType) {
  const validationResult = schema.validate(event, { abortEarly: false, allowUnknown: true, stripUnknown: true })

  if (validationResult.error) {
    throw new Error(`Event is invalid, ${validationResult.error.message}`)
  }
}
