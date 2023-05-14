const SchemaBuilder = require('./lib/SchemaBuilder')

module.exports = {
  // options: ['cacheTimeout', 'redisKeyPrefix', 'host', 'port']
  // host and port are for connecting to redis, cacheTimeout is in seconds
  // redisKeyPrefix is the prefix for all cache keys in Redis
  builder(options = {}) {
    return new SchemaBuilder(options)
  }
}
