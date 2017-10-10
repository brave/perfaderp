'use strict'

const awsUtil = require('../lib/awsUtil')
const aws = require('aws-sdk')

class SqsGetter {
  constructor (queueUrl) {
    this.params = {
      QueueUrl: queueUrl,
        MaxNumberOfMessages: 10
    }
    this.sqs = new aws.SQS(
      Object.assign({}, awsUtil.defaultParams)
    )
  }

  perform () {
    return new Promise((resolve, reject) => {
      this.sqs.receiveMessage(this.params, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
    .catch((error) => {
      console.error(error)
    })
  }
}

module.exports = SqsGetter
