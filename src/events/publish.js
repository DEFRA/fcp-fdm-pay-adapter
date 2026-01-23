import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

import { config } from '../config.js'

const { sns, region, endpoint, accessKeyId, secretAccessKey } = config.get('aws')

const snsClient = new SNSClient({
  region,
  ...(endpoint && {
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  })
})

export async function publishEvent (event) {
  await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify(event),
      TopicArn: sns.topicArn
    })
  )
}
