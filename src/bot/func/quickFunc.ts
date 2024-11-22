import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import {ECommand} from "../../types";
import {telegramKeyboardList} from "../utils/messageUtils";


const quickFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;
  const tgId: number = ctx.from.id;

  const i18n = process["i18n"]

  if (!text.startsWith(`/${ECommand.quick}`)) return next()

  await ctx.reply("--", {
    reply_markup: {
      keyboard: telegramKeyboardList()
    }
  })

}

export default quickFunc
