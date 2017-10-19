'use strict'

const Influx = require('influx')
const config = require('config')

const SCHEMA = [
  {
    measurement: config.influxMeasurementStoryRuntime,
    fields: {
      gitHash: Influx.FieldType.STRING,
      runtime: Influx.FieldType.FLOAT,
      travisRunId: Influx.FieldType.INTEGER
    },
    tags: [
      'profile',
      'story',
      'storyCategory',
      'repo',
      'branch'
    ]
  }
]

const params = {
  database: config.influxDatabase,
  host: config.influxHost,
  port: config.influxPort,
  username: config.influxUsername,
  password: config.influxPassword,
  schema: SCHEMA
}
const client = new Influx.InfluxDB(params)

const connect = function () {
  console.log(`Connecting to influxd on ${params.host}:${params.port}/${params.database}`)
  return new Promise((resolve, _reject) => {
    client.getDatabaseNames()
      .then(names => {
        if (names.includes(config.influxDatabase)) {
          resolve(names)
        }
        resolve(client.createDatabase(config.influxDatabase))
      })
  })
}

module.exports = {
  client,
  connect
}
