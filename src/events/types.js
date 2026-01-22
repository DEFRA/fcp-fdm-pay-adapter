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
    throw new Error(`Unknown event type: ${type}`)
  }
}

export { getEventType }
