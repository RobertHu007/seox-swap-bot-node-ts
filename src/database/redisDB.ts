import Redis from "ioredis";
import config from "../config";

let { host, port, password , dbName} = config.redis;

console.log(host, port);

let _redisClient: Redis;

export function getRedisClient() {
  if (!_redisClient) {
    _redisClient = new Redis({
      host: host,
      port: port,
      password: password,
      maxRetriesPerRequest: null,
      db: dbName
      // 其他连接选项
    });
  }
  return _redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (_redisClient) {
    await _redisClient.quit();
  }
  _redisClient = undefined;
}
