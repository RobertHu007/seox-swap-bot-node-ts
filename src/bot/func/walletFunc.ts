import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {ECommand, WalletInfoType} from "../../types";
import UserService from "../../service/UserService";
import SolanaWalletService from "../../service/SolanaWalletService";
import {showLastSixChars} from "../../utils/strFormatUtils";
import {TGMsgWalletMessage} from "../utils/messageUtils";


const walletFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;

  const tgId: number = ctx.from.id;

  const i18n = process["i18n"]
  const keyboardName = i18n.__('keyboard_wallet')

  if (!text.startsWith(keyboardName) && !text.startsWith(`/${ECommand.wallets}`)) return next()

  const userUtil = await UserService.getInstance()
  const solanaWalletUtil = await SolanaWalletService.getInstance()

  const userInfo = await userUtil.getUserById(tgId)

  if (!userInfo?.address) {
    ctx.reply(i18n.__('wallet_not_have_hint_text'))
    return
  }
  const walletBalance = await solanaWalletUtil.getSolBalance(userInfo.address)
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

}

export default walletFunc
