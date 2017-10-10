'use strict'

// Dependencies
// ===

const config = require('config')
// Web server
const Express = require('express')
const logger = require('./lib/logger')

const influx = require('./lib/influx')
influx.connect().then(() => {

  const scheduler = require('./app/scheduler')
  scheduler.initialize()

  const app = Express()
  app.disable('x-powered-by')

  app.get('/', (request, response) => {
    response.send('🌶🐳🔥')
  })

  app.listen(config.port)

  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`)
  logger.info(`${process.env.npm_package_name} up on localhost:${config.port}`)
})
