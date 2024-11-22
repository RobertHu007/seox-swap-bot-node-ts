import {Context, MiddlewareFn, NarrowedContext, Telegraf} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {EHead} from "../../types";
import UserService from "../../service/UserService";
import SolanaWalletService from "../../service/SolanaWalletService";
import {telegramKeyboardList, TGMsgMenuMessage, TGMsgWelcomeMessage} from "../utils/messageUtils";


const startFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;

  const tgId: number = ctx.from.id;
  const languageCode: string = ctx.from.language_code
  const username: string = ctx.from.username;

  const nickname: string[] = [ctx.from.first_name, ctx.from.last_name]
    .filter(Boolean)

  const i18n = process["i18n"]


  if (!text.startsWith(`/${EHead.start}`)) return next();

  const bot: Telegraf = process["bot"];
  const userUtil = await UserService.getInstance()
  let userInfo = await userUtil.getUserById(tgId)
  const solanaWalletUtil = await SolanaWalletService.getInstance()
  if (!userInfo) {
    await userUtil.createUser(tgId, username, null, null)
    userInfo = await userUtil.getUserById(tgId)
  }
  const tgMsgWelcomeMessage = TGMsgWelcomeMessage()
  await bot.telegram.sendMessage(tgId, tgMsgWelcomeMessage.message, tgMsgWelcomeMessage.extra)
  await bot.telegram.sendMessage(tgId, "--", {
    reply_markup: {
      keyboard: telegramKeyboardList()
    }
  })
  let walletBalance = 0
  if (userInfo?.address) {
    walletBalance = await solanaWalletUtil.getSolBalance(userInfo.address)
  }
  const tgMsgMenuMessage = TGMsgMenuMessage({address: userInfo.address, amount: walletBalance, referralUrl: 'https://www.google.com'})
  await ctx.reply(tgMsgMenuMessage.message, tgMsgMenuMessage.extra)
}

export default startFunc
