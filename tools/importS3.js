'use strict'

const config = require('config')
const awsUtil = require('../lib/awsUtil')
const aws = require('aws-sdk')
const CPUProfileImporter = require('../lib/cpuProfileImporter')
const influx = require('../lib/influx')
const s3 = new aws.S3(
  Object.assign({}, awsUtil.defaultParams)
)

// Import CPU profiles from an S3 bucket.
const params = {
  Bucket: config.s3Bucket, /* required */
  MaxKeys: 1000
  // StartAfter: 'STRING_VALUE'
}

new Promise((resolve, reject) => {
  s3.listObjectsV2(params, function (err, data) {
    if (err) {
      reject(err)
    } else {
      resolve(data.Contents)
    }
  })
})
  .then((items) => {
    influx.connect()
    for (let item of items) {
      const params = {
        Bucket: config.s3Bucket,
        Key: item.Key
      }
      const url = s3.getSignedUrl('getObject', params)
      new CPUProfileImporter(url, influx.client).perform()
    }
  })
  .catch((error) => {
    console.error(error)
  })
