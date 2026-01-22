import { ServiceBusClient } from '@azure/service-bus'

const connectionString = 'Endpoint=sb://localhost:5672;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true'
const topicName = 'fcp-pay-events'

const message = {
  specversion: '1.0',
  type: 'uk.gov.defra.ffc.pay.payment.enriched',
  source: 'ffc-pay-enrichment',
  id: '123e4567-e89b-12d3-a456-426655440000',
  time: '2020-01-01T12:00:00Z',
  subject: 'Payment request enriched',
  datacontenttype: 'text/json',
  data: {
    frn: 1234567890,
    schemeId: 1,
    correlationId: '123e4567-e89b-12d3-a456-426655440000',
    invoiceNumber: 'S1234567S1234567V001'
  }
}

const sbClient = new ServiceBusClient(connectionString)
const sender = sbClient.createSender(topicName)

await sender.sendMessages({ body: message, contentType: 'application/json' })

console.log('Test message sent successfully!')
console.log(JSON.stringify(message, null, 2))

await sender.close()
await sbClient.close()
