import moment from "moment";
import i18n from "i18n"
import {en} from "./locales/en";
import {zhCN} from "./locales/zhCN";
import {zhTW} from "./locales/zhTW";
import initBot from "./bot";
import config from "./config";
import {TGMsgCommandList} from "./bot/utils/messageUtils";
import App from "./app";

const {BOT_TOKEN} = config

async function main() {

  await init();

  await initI18n();

  // await initApp();

  await launchBot();

  process.on("uncaughtException", (e) => {
    console.log("uncaughtException:", e);
  });

}

const init = async () => {
  process.env.TZ = 'Asia/Shanghai';
  console.log('显示服务器本地时区的时间',moment().format(),new Date()); // 这将显示服务器本地时区的时间
}

const initI18n = async () => {
  i18n.configure({
    locales: ['en'],
    staticCatalog: {
      en: en,
      zhCN: zhCN,
      zhTW: zhTW
    },
    defaultLocale: 'en',
    queryParameter: 'lang',
    objectNotation: true,
    retryInDefaultLocale: true
  })
  process["i18n"] = i18n
  // process["i18nByBackend"] = i18n
}

const initApp = async () => {
  const app = new App()
  await app.start()
}

const launchBot = async () => {
  const bot = await initBot(BOT_TOKEN)

  await bot.telegram.setMyCommands(TGMsgCommandList())
  await bot.launch()

  const botId = bot.botInfo.id;
  const username = bot.botInfo.username;
  const nickname = [bot.botInfo.first_name, bot.botInfo.last_name]
    .filter(Boolean)
    .join(" ");

  console.log(`bot id: ${botId}`);
  console.log(`bot username: ${username}`);
  console.log(`bot nickname: ${nickname}`);
  console.log(`bot launch: ${config.BOT_TOKEN}`);
  process["bot"] = bot;
}

main()
