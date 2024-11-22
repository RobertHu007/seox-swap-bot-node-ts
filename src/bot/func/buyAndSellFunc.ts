import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {ECommand} from "../../types";


const buyAndSellFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;
  const tgId: number = ctx.from.id;

  const i18n = process["i18n"]
  const keyboardName = i18n.__('keyboard_buy_sell')
  if (!text.startsWith(keyboardName)) return next()

  ctx.reply(i18n.__('enter_address_hint_text'))

}
export default buyAndSellFunc
