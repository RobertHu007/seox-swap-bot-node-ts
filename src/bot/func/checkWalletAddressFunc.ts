import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import SolanaWalletService from "../../service/SolanaWalletService";
import RaydiumService from "../../service/RaydiumService";
import UserService from "../../service/UserService";
import config from "../../config";
import {GasFeeDataType, TradeMessageInfoType} from "../../types";
import {getTradeInfo} from "../../utils/tradeUtils";
import {TGMsgTradeMessage} from "../utils/messageUtils";
import {getRedisClient} from "../../database/redisDB";

const {CURRENCY_NAME} = config

const checkWalletAddressFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;

  const tgId: number = ctx.from.id;

  const i18n = process["i18n"]

  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const isValidAddress = solanaWalletUtil.isValidAddress(text)
  if (!isValidAddress) return next()

  // const solanaWalletUtil = await SolanaWalletService.getInstance()

  // const gasFeeDataResp = await getAxiosClient().get('https://api-v3.raydium.io/main/auto-fee')
  // let gasFeeData = gasFeeDataResp.data['data']['default'] as GasFeeDataType


  const accountInfoRes = await solanaWalletUtil.accountInfo(text)

  const userUtil = await UserService.getInstance()

  console.log("accountInfo", accountInfoRes)

  if (!accountInfoRes.status) {
    ctx.reply(i18n.__("not_token_info_hint_text"))
    return
  }

  const userInfo = await userUtil.getUserById(tgId)

  const raydiumUtil = await RaydiumService.getInstance(userInfo.privateKey)

  // const accountInfo = accountInfoRes.accountInfo

  const mintAddress = text.trim()

  const tokenInfo = await raydiumUtil.getTokenInfo(mintAddress)
  if (tokenInfo.length === 0) {
    ctx.reply(i18n.__('not_token_info_hint_text'))
    return
  }
  const tradePoolInfo = await getTradeInfo(userInfo, mintAddress, tokenInfo)
  const messageInfo = tradePoolInfo.tradeInfo
  if (messageInfo) {
    const tgMsgTradeMessage = TGMsgTradeMessage(messageInfo)
    ctx.reply(tgMsgTradeMessage.message, tgMsgTradeMessage.extra).then(resp => {
      const messageId = resp.message_id
      const redisClient = getRedisClient()
      redisClient.set(`lastTradeMessageId:${tgId}`, messageId)
      const saveDBInfo: TradeMessageInfoType = {
        poolId: tgMsgTradeMessage.poolId,
        symbol: tgMsgTradeMessage.symbol,
        decimals: messageInfo.currencyDecimals
      }
      redisClient.set(`tradeMessageIdInfo:${resp.message_id}`, JSON.stringify(saveDBInfo))
    })
    return
  }
  ctx.reply(i18n.__('not_token_info_hint_text'))

}

export default checkWalletAddressFunc
