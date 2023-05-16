const redis = require('redis')
const md5 = require('md5')

class Cache {
  constructor(options) {
    if (options) {
      if (!(typeof options === 'object') || Array.isArray(options)) {
        throw new Error('Caching options must be an object')
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
        port: Number(options.port),
        host: options.host
      })
      this.redisKeyPrefix = options.redisKeyPrefix || 'gqlCache'
      this.timeout = Number(options.cacheTimeout) || 3600
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
    try {
      const bodyData = request.body || request.res
      if (!bodyData) return null
      return `${this.redisKeyPrefix}_${md5(JSON.stringify(bodyData))}`
    } catch (error) {
      return null
    }
  }

  async getCache(request) {
    const cacheKey = this.generateRedisKey(request)
    if (this.enabled && cacheKey) {
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
    const cacheKey = this.generateRedisKey(request)
    if (this.enabled && cacheKey) {
      await this.redisClient.setex(this.generateRedisKey(request), parseInt(this.timeout), JSON.stringify(result))
    }
  }
}

module.exports = Cache
