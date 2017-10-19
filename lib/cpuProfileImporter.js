'use strict'

const {CPUProfile} = require('webkit-cpu-profiler-tools')
const config = require('config')
const request = require('request')

const DATA_FROM_URL_PATHNAME_REGEX = /^\/(?:(.+)\/)?(.+)\/([0-9a-zA-Z\-]+)--([0-9a-zA-Z\-]+)\/([0-9a-zA-Z.\-%:]+)/
const FILENAME_REGEX = /^(.+?)--(.+?)--(.+)-([\d]{4}.+?)\.cpuprofile/
const GIT_HASH_REGEX = /([0-9a-zA-Z]{10,})/
const TRAVIS_RUN_ID_REGEX = /([\d]{1,10})/

class CPUProfileImporter {
  constructor (url, influxClient) {
    this.url = url
    this.influxClient = influxClient
  }

  cpuProfileFromUrl (url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return reject(error, response, body)
        }
        resolve(body)
      })
    })
      .then((body) => new CPUProfile(body))
  }

  /**
   * @param {string} filename startup--navigate-manually--100-tabs-2017-09-28T23%3A39%3A49.451Z.cpuprofile
   * @returns {object}
   */
  dataFromFilename (filename) {
    const string = decodeURIComponent(filename)
    const match = string.match(FILENAME_REGEX)
    const storyCategory = match[1]
    const story = match[2]
    const profile = match[3]
    const timestamp = Date.parse(match[4])
    return {storyCategory, story, profile, timestamp}
  }

  /**
   * @param {string} url e.g. https://bucket.s3.amazonaws.com/brave/browser-laptop/15234--a1b2c3d4e5d6/startup--navigate-manually--100-tabs-2017-09-28T23%3A39%3A49.451Z.cpuprofile
   * @returns {object}
   */
  dataFromUrl (myUrl) {
    const url = require('url')
    const parsedUrl = url.parse(myUrl)
    const match = parsedUrl.pathname.match(DATA_FROM_URL_PATHNAME_REGEX)
    if (!match) {
      throw new Error('Invalid URL format, should be like https://bucket.s3.amazonaws.com/brave/browser-laptop/master/15234--a1b2c3d4e5d6/startup--navigate-manually--100-tabs-2017-09-28T23%3A39%3A49.451Z.cpuprofile')
    }
    const repo = match[1]
    const branch = match[2]
    const travisRunId = match[3]
    const gitHash = match[4]
    const fileData = this.dataFromFilename(match[5])
    const data = Object.assign({repo, branch, travisRunId, gitHash}, fileData)
    return data
  }

  dataFromCpuProfile (cpuProfile) {
    const nodes = cpuProfile.getFilteredTimelineData()
    return {runtime: nodes[0].total}
  }

  pointFromData (data) {
    return {
      measurement: config.influxMeasurementStoryRuntime,
      fields: {
        gitHash: data.gitHash,
        runtime: data.runtime,
        travisRunId: data.travisRunId
      },
      tags: {
        profile: data.profile,
        story: data.story,
        storyCategory: data.storyCategory,
        repo: data.repo,
        branch: data.branch
      },
      timestamp: data.timestamp,
    }
  }

  perform () {
    this.cpuProfileFromUrl(this.url)
      .then((cpuProfile) => {
        console.log(`Importing ${this.url}`)
        const data = Object.assign(
          {},
          this.dataFromCpuProfile(cpuProfile),
          this.dataFromUrl(this.url)
        )
        const point = this.pointFromData(data)
        console.log(point)
        return this.influxClient.writePoints([point], {precision: 'ms'})
          .catch(err => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
          })
      })
      .catch((e) => {
        console.error(e)
      })
  }
}

module.exports = CPUProfileImporter
