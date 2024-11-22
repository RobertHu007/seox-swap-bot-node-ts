import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {CustomAmountType, EMenuBtn, ReplyMsgType} from "../../types";
import SolanaWalletService from "../../service/SolanaWalletService";
import UserService from "../../service/UserService";
import {
  getTelegramReplyMessage,
  getTelegramUserLanguageLocal,
  setTelegramUserLanguageLocal
} from "../../utils/redisUtils";
import {getRedisClient} from "../../database/redisDB";
import {tradeSwap} from "../../utils/tradeUtils";


const replyMessageFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const i18n = process["i18n"]
  const tgId: number = ctx.from.id;
  const messageId = ctx.message.message_id

  const l_locale = await getTelegramUserLanguageLocal(tgId)

  if (l_locale) {
    i18n.setLocale(l_locale)
  } else {
    await setTelegramUserLanguageLocal(tgId, 'en')
    i18n.setLocale('en')
  }

  if (!ctx.message.reply_to_message) return next()

  const userUtil = await UserService.getInstance()

  const redisClient = getRedisClient()

  const reply_to_message_id = ctx.message.reply_to_message.message_id

  const reply_text = ctx.message.text

  const replyInfo: ReplyMsgType = await getTelegramReplyMessage<ReplyMsgType>(reply_to_message_id)

  const solanaWalletUtils = await SolanaWalletService.getInstance()

  const userInfo = await userUtil.getUserById(tgId)

  switch (replyInfo.type) {
    case EMenuBtn.import_wallet:
      try {
        const walletInfo = solanaWalletUtils.importWallet(reply_text)
        await userUtil.updateUser(tgId, {address: walletInfo.address, privateKey: walletInfo.privateKey})
        ctx.reply(i18n.__('bind_wallet_success_text'))
      } catch (e) {
        ctx.reply(i18n.__('bind_wallet_error_text'))
      }
      ctx.deleteMessage(messageId)
      return
    case "trade_buy":
      const tradeBuyReplyInfo: CustomAmountType = await getTelegramReplyMessage<CustomAmountType>(reply_to_message_id)
      // const tradeMessageInfoByDB = await redisClient.get(`tradeMessageIdInfo:${tradeBuyReplyInfo.tradeMessageId}`)
      const inputNum1 = Number(reply_text)
      tradeSwap(ctx, 'buy', tradeBuyReplyInfo.mintAddress, userInfo, inputNum1, tradeBuyReplyInfo.tradeMessageId).then(() => {

      }).catch((e) => {
        ctx.reply("❌交易失败")
      })
      return
    case "trade_sell":
      const tradeSellReplyInfo: CustomAmountType = await getTelegramReplyMessage<CustomAmountType>(reply_to_message_id)
      const inputNum2 = Number(reply_text)
      tradeSwap(ctx, 'buy', tradeSellReplyInfo.mintAddress, userInfo, inputNum2, tradeSellReplyInfo.tradeMessageId).then(() => {

      }).catch((e) => {
        ctx.reply("❌交易失败")
      })
      return
  }

}

export default replyMessageFunc
