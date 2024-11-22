import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {ECommand} from "../../types";
import UserService from "../../service/UserService";
import SolanaWalletService from "../../service/SolanaWalletService";
import {TGMsgMenuMessage} from "../utils/messageUtils";


const menuFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;
  const tgId: number = ctx.from.id;

  const i18n = process["i18n"]
  const keyboardName = i18n.__('keyboard_menu')

  if (!text.startsWith(keyboardName) && !text.startsWith(`/${ECommand.menu}`)) return next()

  const userUtil = await UserService.getInstance()
  let userInfo = await userUtil.getUserById(tgId)
  const solanaWalletUtil = await SolanaWalletService.getInstance()

  let walletBalance = 0
  if (userInfo.address) {
    walletBalance = await solanaWalletUtil.getSolBalance(userInfo.address)
  }
  const tgMsgMenuMessage = TGMsgMenuMessage({address: userInfo.address, amount: walletBalance, referralUrl: 'https://www.google.com'})
  await ctx.reply(tgMsgMenuMessage.message, tgMsgMenuMessage.extra)

}

export default menuFunc
