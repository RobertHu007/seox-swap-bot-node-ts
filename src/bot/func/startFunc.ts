import {Context, MiddlewareFn, NarrowedContext, Telegraf} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {EHead} from "../../types";
import SolanaWalletService from "../../service/SolanaWalletService";
import conf from "../../config";
const {WALLET_ADDRESS} = conf

const startFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;
  // const tgId: number = ctx.from.id;
  // const languageCode: string = ctx.from.language_code
  // const username: string = ctx.from.username;
  //
  // const nickname: string[] = [ctx.from.first_name, ctx.from.last_name]
  //   .filter(Boolean)
  //
  // const i18n = process["i18n"]


  if (!text.startsWith(`/${EHead.start}`)) return next();

  const solanaWalletUtil = await SolanaWalletService.getInstance()
  let walletBalance = 0
  if (WALLET_ADDRESS) {
    walletBalance = await solanaWalletUtil.getSolBalance(WALLET_ADDRESS)
  }
  const messageList = [
    "当前账户余额（SOL）：",
    `${walletBalance} SOL`,
    "",
    "发送池子ID 或者 Mint Address马上进行交易！"
  ]
  ctx.reply(messageList.join("\n"))
}

export default startFunc
