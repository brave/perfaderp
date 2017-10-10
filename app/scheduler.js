'use strict'

const schedule = require('node-schedule')
const importProfilesFromSqs = require('../jobs/importProfilesFromSqs')

// Public
// ===

const jobs = []

const initialize = function () {
  jobs.push(schedule.scheduleJob('* * * * *', importProfilesFromSqs))
  return jobs
}

module.exports = {
  initialize,
  jobs
}
