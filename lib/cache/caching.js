const redis = require('redis')
const md5 = require('md5')

class Cache {
  constructor(options, enabled) {
    if (options.enabled) {
      this.validate(options)
    }
    this.redisClient = redis.createClient({
      port: +options.port,
      host: options.host
    })
    this.enabled = enabled
    this.redisKeyPrefix = options.redisKeyPrefix || 'gqlCache'
    this.timeout = options.cacheTimeout
  }
  validate(options) {
    if (isNaN(+options.port)) {
      throw new Error('Invalid Redis port, redis port is not a valid number')
    }
    if (!(typeof options.host === 'string')) {
      throw new Error('Invalid Redis host')
    }
    if (this.timeout) {
      if (!(typeof +this.timeout === 'number')) {
        throw new Error('Invalid Timeout value, timeout is not a number')
      }
    }
  }

  generateRedisKey(httpRequest) {
    return `${this.redisKeyPrefix}_`.concat(md5(httpRequest.body))
  }
  async getCache(httpRequest) {
    if (this.enabled) {
      return new Promise((resolve, reject) => {
        this.redisClient.get(this.generateRedisKey(httpRequest), (error, value) => {
          if (error) return reject(error)
          if (value) return resolve(JSON.parse(value))
          return resolve(null)
        })
      })
    }
  }
  async cacheResult(httpRequest, result) {
    if (this.enabled) {
      await this.redisClient.setex(this.generateRedisKey(httpRequest), parseInt(this.timeout || 3600), JSON.stringify(result))
    }
  }
}
module.exports = Cache
