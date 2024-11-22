import {Context, Telegraf} from "telegraf";
import {CustomAmountType, EActionBtn, EMenuBtn, ReplyMsgType, TradeMessageInfoType, WalletInfoType} from "../../types";
import SolanaWalletService from "../../service/SolanaWalletService";
import UserService from "../../service/UserService";
import RaydiumService from "../../service/RaydiumService";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {
  getTelegramUserLanguageLocal,
  setTelegramReplyMessage,
  setTelegramUserLanguageLocal
} from "../../utils/redisUtils";
import {
  telegramKeyboardList,
  TGMsgMenuMessage,
  TGMsgTradeMessage,
  TGMsgWalletMessage,
  TGMsgWelcomeMessage
} from "../utils/messageUtils";
import {showLastSixChars} from "../../utils/strFormatUtils";
import {getRedisClient} from "../../database/redisDB";
import {getTradeInfo, tradeSwap} from "../../utils/tradeUtils";


export const callbackQueryFunc = async (ctx: Context) => {

  const i18n = process["i18n"]
  const queryData = ctx.callbackQuery?.data
  const tgId = ctx.chat.id
  const queryDataSplit = queryData.split('-')
  const l_locale = await getTelegramUserLanguageLocal(tgId)

  if (l_locale) {
    i18n.setLocale(l_locale)
  }

  switch (queryDataSplit[0]) {
    case 'language':
      return await languageCallBack(ctx, queryDataSplit[1])
    case 'menu':
      return await menuCallBack(ctx, queryData)
    case 'wallet':
      return await walletCallBack(ctx, queryData)
    case 'action':
      return await actionCallBack(ctx, queryData)
    case 'trade':
      return await tradeCallBack(ctx, queryData)
  }

}

const menuCallBack = async (ctx: Context, menuText: string)=> {
  const i18n = process["i18n"]
  const tgId: number = ctx.from.id;
  const solanaWalletUtils = await SolanaWalletService.getInstance()
  const userUtil = await UserService.getInstance()
  const userInfo = await userUtil.getUserById(tgId)
  switch (menuText) {
    case EMenuBtn.language:
      const tgMsgWelcomeMessage = TGMsgWelcomeMessage()
      await ctx.reply(tgMsgWelcomeMessage.message, tgMsgWelcomeMessage.extra)
      return
    case EMenuBtn.import_wallet:
      if (userInfo.address) {
        return ctx.reply("已经绑定了钱包💰")
      }
      ctx.reply(i18n.__("import_wallet_hint_text"), {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: '0x...',
          inline_keyboard: []
        }
      }).then(resp => {
        const replyInfo: ReplyMsgType = {
          type: EMenuBtn.import_wallet,
          tgId: tgId
        }
        setTelegramReplyMessage<ReplyMsgType>(resp.message_id, replyInfo)
      })
      return
    case EMenuBtn.generate_wallet:
      if (userInfo.address) {
        return ctx.reply("已经绑定了钱包💰")
      }
      await ctx.reply(i18n.__('generate_wait_text')).then(resp => {
        setTimeout(() => {
          ctx.deleteMessage(resp.message_id)
        }, 2000)
      })
      const generateWalletInfo = solanaWalletUtils.generateWallet()
      await userUtil.updateUser(tgId, {address: generateWalletInfo.address, privateKey: generateWalletInfo.privateKey})
      const generateMessageList = [
        i18n.__("generate_success_text"),
        i18n.__('generate_wallet'),
        `<code>${generateWalletInfo.address}</code>`,
        i18n.__('generate_wallet_private_key'),
        `<code>${generateWalletInfo.privateKey}</code>`,
        '\n',
        i18n.__('generate_hint_text1'),
        i18n.__('generate_hint_text2'),
        i18n.__('generate_hint_text3')
      ]
      ctx.reply(generateMessageList.join('\n'), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: []
        },
      } as any).then(resp => {
        setTimeout(() => {
          ctx.deleteMessage(resp.message_id)
        }, 20 * 1000)
      })
      return
    case EMenuBtn.wallet:
      // const userInfo = await userUtil.getUserById(tgId)
      if (!userInfo?.address) {
        ctx.reply(i18n.__('wallet_not_have_hint_text'))
        return
      }
      const walletBalance = await solanaWalletUtils.getSolBalance(userInfo.address)
      const walletList: Array<WalletInfoType> = [
        {
          address: userInfo.address,
          name: showLastSixChars(userInfo.address),
          isDefault: true,
          balance: walletBalance,
          id: 1
        },
      ]
      const tgMsgWalletMessage = TGMsgWalletMessage({walletList: walletList})

      await ctx.reply(tgMsgWalletMessage.message, tgMsgWalletMessage.extra)
      return
    case EMenuBtn.buy_sell:
      ctx.reply(i18n.__('enter_address_hint_text'))
      return
  }
}

const walletCallBack = async (ctx: Context, walletText: string) => {

}

const actionCallBack = async (ctx: Context, actionText: string) => {
  const i18n = process["i18n"]
  const tgId: number = ctx.from.id;
  const messageId = ctx.update['callback_query'].message.message_id
  const userUtil = await UserService.getInstance()
  const solanaWalletUtil = await SolanaWalletService.getInstance()

  switch (actionText) {
    case EActionBtn.back:
      const userInfo = await userUtil.getUserById(tgId)
      const walletBalance = await solanaWalletUtil.getSolBalance(userInfo.address)
      const tgMsgMenuMessage = TGMsgMenuMessage({address: userInfo.address, amount: walletBalance,referralUrl: 'https://www.google.com'})
      const markup = tgMsgMenuMessage.extra as any
      await ctx.editMessageText(tgMsgMenuMessage.message, markup)
      return
  }
}

const languageCallBack = async (ctx: Context, lang: string) => {

  const i18n = process["i18n"]
  const tgId = ctx.chat.id
  i18n.setLocale(lang)
  await setTelegramUserLanguageLocal(tgId, lang)
  const bot: Telegraf = process["bot"];

  const userUtil = await UserService.getInstance()

  const solanaWalletUtil = await SolanaWalletService.getInstance()

  let userInfo = await userUtil.getUserById(tgId)

  const walletBalance = await solanaWalletUtil.getSolBalance(userInfo.address)

  const messageId = ctx.update['callback_query'].message.message_id

  const markup = TGMsgWelcomeMessage().extra.reply_markup as any

  await ctx.telegram.editMessageReplyMarkup(tgId, messageId, ctx.inlineMessageId, markup)
  await bot.telegram.sendMessage(tgId, "--", {
    reply_markup: {
      keyboard: telegramKeyboardList()
    }
  })
  const tgMsgMenuMessage = TGMsgMenuMessage({address: userInfo.address, amount: walletBalance, referralUrl: 'https://www.google.com'})
  await ctx.reply(tgMsgMenuMessage.message, tgMsgMenuMessage.extra)

}

const tradeCallBack = async (ctx: Context, tradeText: string) => {
  const i18n = process["i18n"]
  const tradeTypeStr = tradeText.split('-')[1]
  const actionTypeStr = tradeTypeStr.split('_')[0] // 操作： 买 卖 刷新 创建限价
  const lastActionStr = tradeTypeStr.split('_')[1] // 数字
  const tgId: number = ctx.from.id;
  const messageId: number = ctx.update['callback_query'].message.message_id

  const userUtil = await UserService.getInstance()
  const redisClient = getRedisClient()
  const solanaWalletUtil = await SolanaWalletService.getInstance()

  const userInfo = await userUtil.getUserById(tgId)

  const refreshTokenInfo = async () => {
    console.log("开始刷新：", lastActionStr)
    const mintAddress = lastActionStr
    const raydiumUtil = await RaydiumService.getInstance(userInfo.privateKey)
    const tokenInfo = await raydiumUtil.getTokenInfo(mintAddress)
    const tradePoolInfo = await getTradeInfo(userInfo, mintAddress, tokenInfo)
    const messageInfo = tradePoolInfo.tradeInfo
    const tgMsgTradeMessage = TGMsgTradeMessage(messageInfo)
    ctx.editMessageText(tgMsgTradeMessage.message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          ...tgMsgTradeMessage.inlineKeyboardList
        ]
      }
    })
    console.log("刷新完成")
  }
  const customAmount = async () => {
    const isTradeAction = actionTypeStr === 'buy'
    const mintAddress = tradeTypeStr.split('_')[2]
    if (isTradeAction) {
      ctx.reply("输入买入数量(SOL)", {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: '0 SOL',
          inline_keyboard: []
        }
      }).then(resp => {
        const replyInfo: CustomAmountType = {
          type: 'trade_buy',
          tgId: tgId,
          tradeMessageId: messageId,
          mintAddress
        }
        setTelegramReplyMessage<CustomAmountType>(resp.message_id, replyInfo)
      })
    } else {
      ctx.reply("输入卖出数量(%)", {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: '0 %',
          inline_keyboard: []
        }
      }).then(resp => {
        const replyInfo: CustomAmountType = {
          type: 'trade_sell',
          tgId: tgId,
          tradeMessageId: messageId,
          mintAddress
        }
        setTelegramReplyMessage<CustomAmountType>(resp.message_id, replyInfo)
      })
    }
  }

  if (actionTypeStr === 'reloadBtn') {
    await refreshTokenInfo()
  } else {
    if (!userInfo.address) {
      ctx.reply(i18n.__('wallet_not_have_hint_text'))
      return
    }
    if (lastActionStr === 'x') {
      await customAmount()
      return
    }
    let mintAddress = tradeTypeStr.split('_')[2]
    tradeSwap(ctx, actionTypeStr, mintAddress, userInfo, lastActionStr, messageId).then(() => {

    }).catch(e => {
      ctx.reply("❌交易失败")
    })

  }
}
