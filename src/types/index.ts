import {Context, Telegraf} from "telegraf";

export type IBotContext = Context & {};

export type IAbilityFunc = (bot: Telegraf<IBotContext>) => void;

export enum EHead {
  start = "start",
}

export enum EMenuBtn {
  import_wallet = "menu-import_wallet",
  generate_wallet = "menu-generate_wallet",
  buy_sell = "menu-buy_sell",
  limit_order = "menu-limit_order",
  copy_trading = "menu-copy_trading",
  asset = "menu-asset",
  wallet = "menu-wallet",
  setting = "menu-setting",
  language = "menu-language",
  help = "menu-help",
  invite_friends = "menu-invite_friends",
}

export enum EWalletBtn {
  change_default = "wallet-change_default",
  set_wallet_name = "wallet-set_wallet_name",
  unbind = "wallet-unbind",
  export_private_key = "wallet-export_private_key",
  withdraw = "wallet-withdraw",
}

export enum ETradeBtn {
  buy = 'trade-buy',
  sell = 'trade-sell',
  reload = 'trade-reloadBtn'
}

export enum EActionBtn {
  back = "action-wallet_back",
}

export enum ECommand {
  quick = "quick",
  menu = "menu",
  asset = "asset",
  wallets = "wallets",
  limit = "limit",
  follow = "follow",
  referral = "referral",
  help = "help",
}

export type ReplyMsgType = {
  type: string,
  tgId: number
}

export type WalletInfoType = {
  address: string,
  name: string,
  isDefault: boolean,
  balance: number,
  id: number
}

export type TradeMessageInfoType = {
  poolId: string,
  symbol: string,
  decimals: number
}

export type CustomAmountType = {
  type: string,
  tgId: number,
  tradeMessageId: number,
  mintAddress: string
}

export type GasFeeDataType = {
  vh: number,
  h: number,
  m: number
}
