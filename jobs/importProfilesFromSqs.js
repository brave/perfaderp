'use strict'

const config = require('config')
const awsUtil = require('../lib/awsUtil')
const aws = require('aws-sdk')
const SqsGetter = require('../lib/sqsGetter')
const CPUProfileImporter = require('../lib/cpuProfileImporter')
const influx = require('../lib/influx')

const perform = () => {
  const sqsGetter = new SqsGetter(config.sqsEndpointCpuProfiles)
  sqsGetter.perform()
    .then((result) => {
      if (!result.Messages || !result.Messages.length) {
        console.log('No new SQS messages.')
        return
      }
      console.log(`Got ${result.Messages.length} SQS messages.`)
      const s3 = new aws.S3(
        Object.assign({}, awsUtil.defaultParams)
      )
      for (let message of result.Messages) {
        const data = JSON.parse(message.Body)
        if (!data.Records || !data.Records.length) {
          continue
        }
        for (let record of data.Records) {
          const s3Params = {
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key
          }
          if (!s3Params.Bucket || !s3Params.Key) {
            console.info(`Skipping record missing S3 bucket or key: ${record}`)
            continue
          }
          s3Params.Key = decodeURIComponent(s3Params.Key)
          const url = s3.getSignedUrl('getObject', s3Params)
          new CPUProfileImporter(url, influx.client).perform()
        }
      }
    })
    .catch((error) => {
      console.error(error)
    })
}

module.exports = perform
