const redisClient = require("../config/redis.js");

async function invalidateWordCache(affectedCategory = "*") {
  let cursor = 0;
  do {
    const reply = await redisClient.scan(cursor, {
      MATCH: `category:${affectedCategory}`,
      COUNT: 100,
    });
    cursor = reply.cursor;
    const keys = reply.keys;

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } while (cursor !== 0);
}

module.exports = { invalidateWordCache };
