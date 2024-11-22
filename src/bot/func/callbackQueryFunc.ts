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

  }

}
