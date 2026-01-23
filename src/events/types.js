function getEventType (type) {
  if (type.startsWith('uk.gov.defra.ffc.pay.payment.')) {
    return 'payment'
  } else if (type.startsWith('uk.gov.defra.ffc.pay.hold.')) {
    return 'hold'
  } else if (type.startsWith('uk.gov.defra.ffc.pay.warning.')) {
    return 'warning'
  } else if (type.startsWith('uk.gov.defra.ffc.pay.batch.')) {
    return 'batch'
  } else {
    const error = new Error(`Unknown event type: ${type}`)
    error.category = 'VALIDATION'
    throw error
  }
}

export { getEventType }
