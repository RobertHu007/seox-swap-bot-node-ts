// Redis 获取tg用户的语言
import {ReplyMsgType} from "../types";
import {getRedisClient} from "../database/redisDB";

export const getTelegramUserLanguageLocal = async (tgId: number) => {
  try {
    const redisClient = getRedisClient()
    const locale = await redisClient.get(`locale:${tgId}`)
    if (locale) {
      return locale
    }
    return null
  } catch (e) {
    return null
  }
}

// Redis 设置tg用户的语言
export const setTelegramUserLanguageLocal = async (tgId: number, locale: string) => {
  try {
    const redisClient = getRedisClient()
    await redisClient.set(`locale:${tgId}`, locale)
    return true
  } catch (e) {
    return false
  }
}

// Redis save 回复消息
export const setTelegramReplyMessage = async <T>(replyMessageId: number, info: T) => {
  try {
    const redisClient = getRedisClient()
    await redisClient.set(`reply:${replyMessageId}`, JSON.stringify(info))
    return true
  } catch (e) {
    return false
  }
}

// 获取Redis 存储的消息
export const getTelegramReplyMessage = async <T>(replyMessageId: number): Promise<T> => {
  try {
    const redisClient = getRedisClient()
    const info = await redisClient.get(`reply:${replyMessageId}`)
    if (info) {
      return JSON.parse(info) as T
    }
    return null
  } catch (e) {
    return null
  }
}
