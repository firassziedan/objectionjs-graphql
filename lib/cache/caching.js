const redis = require('redis')
const md5 = require('md5')

class Cache {
  constructor(options) {
    if (options) {
      if (!(typeof options === 'object')) {
        throw new Error('Caching options must be an object')
      } else if (Array.isArray(options)) {
        throw new Error('Caching options can not be an array')
      } else {
        const allowedKeys = ['host', 'port', 'cacheTimeout', 'redisKeyPrefix']
        Object.keys(options).forEach(key => {
          if (!allowedKeys.includes(key)) {
            throw new Error(`${key} is not a valid option for GraphQL caching`)
          }
        })
      }
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
    return `${this.redisKeyPrefix}_${md5(request.body)}`
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
