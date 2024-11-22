import {Telegraf} from "telegraf";
import {IAbilityFunc, IBotContext} from "../types";
import {getHttpAgent} from "../utils/networkUtils";
import {callbackQueryFunc} from "./func/callbackQueryFunc";
import replyMessageFunc from "./func/replyMessageFunc";
import checkWalletAddressFunc from "./func/checkWalletAddressFunc";
import startFunc from "./func/startFunc";
import menuFunc from "./func/menuFunc";
import quickFunc from "./func/quickFunc";
import walletFunc from "./func/walletFunc";
import buyAndSellFunc from "./func/buyAndSellFunc";


const botAbility: IAbilityFunc = (bot, ) => {
  bot.on("text", ...[
    replyMessageFunc, checkWalletAddressFunc, startFunc,
    menuFunc, quickFunc, walletFunc, buyAndSellFunc
  ])
  bot.on('callback_query', callbackQueryFunc)
}

async function initBot(token: string) {
  let bot: Telegraf<IBotContext>;
  let options: Partial<Telegraf.Options<IBotContext>> = {};
  let env: any = process.env.NODE_ENV;

  if (env === 'dev') {
    options = {
      ...options,
      telegram: {
        agent: getHttpAgent()
      }
    }
  }

  bot = new Telegraf<IBotContext>(token, options);

  botAbility(bot)

  bot.catch((e) => {
    console.log("###################################");
    console.log(e);
    console.log("###################################");
  });

  return bot;
}

export default initBot
