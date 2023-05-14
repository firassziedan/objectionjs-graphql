const redis = require('redis')
const md5 = require('md5')

class Cache {
  constructor(options) {
    if (!typeof options === 'object' || Array.isArray(options) || Object.keys(options).length === 0) {
      if (Array.isArray(options)) {
        throw new Error('Invalid Cache options, options must be an Object (JSON)')
      }
    } else {
      this.validate(options)
      this.redisClient = redis.createClient({
        port: +options.port,
        host: options.host
      })
      this.redisKeyPrefix = options.redisKeyPrefix || 'gqlCache'
      this.timeout = +options.cacheTimeout || 3600
    }
  }
  validate(options) {
    if (isNaN(+options.port)) {
      throw new Error('Invalid Redis port, redis port is not a valid number')
    }
    if (!(typeof options.host === 'string')) {
      throw new Error('Invalid Redis host')
    }
    if (options.timeout) {
      if (!(typeof +options.timeout === 'number')) {
        throw new Error('Invalid Timeout value, timeout is not a number')
      }
    }
    this.enabled = true
  }

  generateRedisKey(request) {
    return `${this.redisKeyPrefix}_`.concat(md5(request.body))
  }
  async getCache(request) {
    if (this.enabled) {
      return new Promise((resolve, reject) => {
        this.redisClient.get(this.generateRedisKey(request), (error, value) => {
          if (error) return reject(error)
          if (value) return resolve(JSON.parse(value))
          return resolve(null)
        })
      })
    }
  }
  async cacheResult(request, result) {
    if (this.enabled) {
      await this.redisClient.setex(this.generateRedisKey(request), parseInt(this.timeout), JSON.stringify(result))
    }
  }
}
module.exports = Cache
