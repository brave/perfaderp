'use strict'

const config = require('config')

const defaultParams = {
  "accessKeyId": config.awsAccessKeyId,
  "secretAccessKey": config.awsSecretAccessKey,
  "region": config.awsDefaultRegion
}

module.exports = {
  defaultParams
}
