const SchemaBuilder = require('./lib/SchemaBuilder')

module.exports = {
  // options: ['enableCache', 'cacheTimeout', 'redisKeyPrefix', 'host', 'port']
  // host and port are for connecting to redis, cacheTimeout is in seconds
  // redisKeyPrefix is the prefix for all cache keys in Redis
  // enableCache is a boolean value which indicates whether caching should be enabled or not
  builder(options = {}) {
    return new SchemaBuilder(options)
  }
}
