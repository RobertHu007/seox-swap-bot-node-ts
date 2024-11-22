import * as tg from "telegraf/src/core/types/typegram";
import * as tt from "telegraf/src/telegram-types";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import {EActionBtn, ECommand, EMenuBtn, ETradeBtn, EWalletBtn, WalletInfoType} from "../../types";
import config from "../../config";


const {CURRENCY_NAME} = config

export type TGMsgMessageType = {
  message: string,
  extra: tt.ExtraReplyMessage,
  inlineKeyboardList?: InlineKeyboardButton[][]
}

export type TGTradeMessageType = {
  message: string,
  extra: tt.ExtraReplyMessage,
  inlineKeyboardList?: InlineKeyboardButton[][],
  poolId: string,
  symbol: string
}

export function escapeMarkdownV2(text: string) {
  const escapedText = text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  return escapedText;
}

export const transformInlineKeyboard = ({keyboardList = [], colNum = 2}:{keyboardList: Array<InlineKeyboardButton>, colNum?: number}): InlineKeyboardButton[][] => {
  const inlineKeyboardList = []
  let indexNum = 0
  let newList = []
  for (const item of keyboardList) {
    newList.push(item)
    indexNum += 1
    if ((newList.length % colNum) === 0) {
      inlineKeyboardList.push(newList)
      newList = []
    }
    if (indexNum === keyboardList.length) {
      inlineKeyboardList.push(newList)
    }
  }
  return inlineKeyboardList
}

// 欢迎消息并且切换语言
export const TGMsgWelcomeMessage = ():TGMsgMessageType => {
  const i18n = process["i18n"]
  const locale = i18n.getLocale()
  const languageList: Array<InlineKeyboardButton> = [
    {
      text: `${locale === 'en' ? '✅' : ''} English`,
      callback_data: 'language-en'
    },
    {
      text: `${locale === 'zhCN' ? '✅' : ''} 中文(简体)`,
      callback_data: 'language-zhCN'
    },
    {
      text: `${locale === 'zhTW' ? '✅' : ''} 中文(繁体)`,
      callback_data: 'language-zhTW'
    },
  ]
  return {
    message: escapeMarkdownV2(i18n.__('welcome_message_text', {currency: CURRENCY_NAME})),
    extra: {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: transformInlineKeyboard({keyboardList: languageList, colNum: 2})
      }
    }
  }
}

// 指令集合
export const TGMsgCommandList = (): Array<tg.BotCommand> => {
  const i18n = process["i18n"]
  return [
    {command: ECommand.quick, description: "Menu Panel 底部菜单"},
    {command: ECommand.menu, description: "Main Menu 使用菜单"},
    {command: ECommand.asset, description: "Manage Holdings 管理持仓"},
    {command: ECommand.wallets, description: "Manage Wallets 管理钱包"},
    {command: ECommand.limit, description: "Limit orders 限价挂单"},
    {command: ECommand.follow, description: "Copy Trade 跟单买卖"},
    {command: ECommand.referral, description: "Referral Rewards 邀请奖励"},
    {command: ECommand.help, description: "Help 帮助"},
  ]
}

// 输入框下面的按钮
export const telegramKeyboardList = () => {
  const i18n = process["i18n"]
  return [
    [
      {text: i18n.__('keyboard_buy_sell')},
      {text: i18n.__('keyboard_limit_order')},
    ],
    [
      {text: i18n.__('keyboard_copy_trading')},
      {text: i18n.__('keyboard_asset')}
    ],
    [
      {text: i18n.__('keyboard_wallet')},
      {text: i18n.__('keyboard_menu')}
    ]
  ]
}

// 菜单消息
export const TGMsgMenuMessage = ({address, amount, referralUrl}: {address?: string, amount?: number, referralUrl: string}): TGMsgMessageType => {
  const i18n = process["i18n"]
  const helpJumpList = [
    {text: i18n.__('menu_message_help_docs'), url: 'https://www.google.com'},
    {text: i18n.__('menu_message_help_twitter'), url: 'https://www.google.com'},
    {text: i18n.__('menu_message_help_support'), url: 'https://www.google.com'},
    {text: i18n.__('menu_message_help_supportCN'), url: 'https://www.google.com'},
  ]
  const hrefTextList = helpJumpList.map(item => {
    return `<a href="${item.url}">${item.text}</a>`
  })
  const messageList = [
    i18n.__('menu_message_address', { address: address ?? '--' }),
    i18n.__('menu_message_balance', { balance: amount ?? '--', currency: CURRENCY_NAME }),
    '\n',
    i18n.__('menu_message_referral', { url: referralUrl }),
    '\n',
    i18n.__('menu_message_help_text'),
    hrefTextList.join('|')
  ]

  let notWalletMenuList: Array<InlineKeyboardButton> = []

  if (!address) {
    notWalletMenuList = [
      {
        text: i18n.__('menu_message_btn_import_wallet'),
        callback_data: EMenuBtn.import_wallet
      },
      {
        text: i18n.__('menu_message_btn_generate_wallet'),
        callback_data: EMenuBtn.generate_wallet
      },
    ]
  }

  const menuList: Array<InlineKeyboardButton> = [
    {
      text: i18n.__('menu_message_btn_buy_sell'),
      callback_data: EMenuBtn.buy_sell
    },
    {
      text: i18n.__('menu_message_btn_limit_order'),
      callback_data: EMenuBtn.limit_order
    },
    {
      text: i18n.__('menu_message_btn_copy_trading'),
      callback_data: EMenuBtn.copy_trading
    },
    {
      text: i18n.__('menu_message_btn_asset'),
      callback_data: EMenuBtn.asset
    },
    {
      text: i18n.__('menu_message_btn_wallet'),
      callback_data: EMenuBtn.wallet
    },
    {
      text: i18n.__('menu_message_btn_setting'),
      callback_data: EMenuBtn.setting
    },
    {
      text: i18n.__('menu_message_btn_language'),
      callback_data: EMenuBtn.language
    },
    {
      text: i18n.__('menu_message_btn_help'),
      callback_data: EMenuBtn.help
    },
    {
      text: i18n.__('menu_message_btn_invite_friends'),
      callback_data: EMenuBtn.invite_friends
    },
    {
      text: 'Sol Bot',
      url: 'https://www.google.com'
    },
  ]
  return {
    message: messageList.join('\n'),
    extra: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: transformInlineKeyboard({keyboardList: notWalletMenuList.concat(menuList), colNum: 2})
      }
    }
  }
}


export const TGMsgWalletMessage = ({walletList = []}: {walletList: Array<WalletInfoType>}): TGMsgMessageType => {
  const i18n = process["i18n"]
  const messageList = walletList.map(item => {
    const walletStrList = []
    walletStrList.push(`${item.id}: ${item.name} ${item.isDefault && '📌'}`)
    walletStrList.push(i18n.__('wallet_address', {address: item.address}))
    walletStrList.push(i18n.__('wallet_balance', {amount: item.balance, unit: CURRENCY_NAME}))
    return walletStrList.join('\n')
  })
  const keyboardList: Array<InlineKeyboardButton> = [
    {text: i18n.__('wallet_change_default'), callback_data: EWalletBtn.change_default},
    {text: i18n.__('wallet_set_wallet_name'), callback_data: EWalletBtn.set_wallet_name},
    {text: i18n.__('menu_message_btn_import_wallet'), callback_data: EMenuBtn.import_wallet},
    {text: i18n.__('menu_message_btn_generate_wallet'), callback_data: EMenuBtn.generate_wallet},
    {text: i18n.__('wallet_unbind'), callback_data: EWalletBtn.unbind},
    {text: i18n.__('wallet_export_private_key'), callback_data: EWalletBtn.export_private_key},
    {text: i18n.__('wallet_withdraw', {currency: CURRENCY_NAME}), callback_data: EWalletBtn.export_private_key},
  ]
  return {
    message: messageList.join('\n\n'),
    extra: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          ...transformInlineKeyboard({keyboardList: keyboardList, colNum: 2}),
          [
            {
              text: i18n.__('common_back'),
              callback_data: EActionBtn.back
            }
          ]
        ]
      }
    }
  }
}

export type TradeParamsType = {
  mainCurrency: string,
  currency: string,
  currencyDecimals: number,
  mainCurrencyPrice: number,
  currencyPrice: number,
  mintAddress: string,
  tvlAmount: number,
  marketCap: number,
  notMintAuthority: boolean,
  notFreezeAuthority: boolean,
  creationTime: string,
  top10Percent: number,
  solBalance: number,
  tokenBalance: number,
  poolPrice: number,
  poolId: string
}
export const TGMsgTradeMessage = (data: TradeParamsType): TGTradeMessageType => {
  const i18n = process["i18n"]
  const messageList = [
    `📌<a href="www.google.com">${data.currency}</a>`,
    `<code>${data.mintAddress}</code>`,
    '',
    i18n.__('trade_wallet'),
    // '|——SOL1(7oP2...z56E)',
    `|——${i18n.__('trade_balance')}: ${data.solBalance}SOL($${data.solBalance * data.mainCurrencyPrice})`,
    `|——${i18n.__('trade_holding_value')}: ${data.tokenBalance * data.poolPrice} SOL($${data.tokenBalance * data.currencyPrice})`,
    `|___${i18n.__('trade_profit')}: 📈 0%`,
    '',
    i18n.__('trade_trade'),
    `|——${i18n.__('trade_price')}: $${data.currencyPrice}`,
    `|——${i18n.__('trade_market_cap')}: $${data.marketCap}`,
    `|——${i18n.__('trade_token_created')}: ${data.creationTime}`,
    '|——DEX: Raydium',
    `|——${i18n.__('trade_trading_pairs')}: ${data.currency}/${data.mainCurrency}`,
    `|___${i18n.__('trade_pool_sol')}: ${data.tvlAmount}`,
    '',
    '🔍安全',
    `  ${data.notMintAuthority ? '✅':'❌'}${i18n.__('trade_lost_mint_permissions')} ${data.notFreezeAuthority ? '✅' : '❌'}${i18n.__('trade_lost_freeze_permissions')}`,
    `  ${i18n.__('trade_has_burned', {amount: '--'})}`,
    i18n.__('trade_top_10_hold', {amount: data.top10Percent})
  ]

  const buyBtnList:Array<InlineKeyboardButton> = [
    {text: i18n.__('trade_buy', {amount: 0.1}), callback_data: ETradeBtn.buy + `_1_` + data.mintAddress},
    {text: i18n.__('trade_buy', {amount: 0.5}), callback_data: ETradeBtn.buy + `_2_` + data.mintAddress},
    {text: i18n.__('trade_buy', {amount: 1}), callback_data: ETradeBtn.buy + `_3_` + data.mintAddress},
    {text: i18n.__('trade_buy', {amount: 2}), callback_data: ETradeBtn.buy + `_4_` + data.mintAddress},
    {text: i18n.__('trade_buy', {amount: 5}), callback_data: ETradeBtn.buy + `_5_` + data.mintAddress},
    {text: i18n.__('trade_buy', {amount: 'x'}), callback_data: ETradeBtn.buy + '_x_' + data.mintAddress},
  ]

  const sellBtnList:Array<InlineKeyboardButton> = [
    {text: i18n.__('trade_sell', {amount: 1}), callback_data: ETradeBtn.sell + '_1_' + data.mintAddress},
    {text: i18n.__('trade_sell', {amount: 5}), callback_data: ETradeBtn.sell + '_5_' + data.mintAddress},
    {text: i18n.__('trade_sell', {amount: 10}), callback_data: ETradeBtn.sell + '_10_' + data.mintAddress},
    {text: i18n.__('trade_sell', {amount: 20}), callback_data: ETradeBtn.sell + '_20_' + data.mintAddress},
    {text: i18n.__('trade_sell', {amount: 50}), callback_data: ETradeBtn.sell + '_50_' + data.mintAddress},
    {text: i18n.__('trade_sell', {amount: 'x'}), callback_data: ETradeBtn.sell + '_x_' + data.mintAddress},
  ]

  const inlineKeyboardList = [
    [
      {text: i18n.__('trade_refresh_currency', {currency: data.currency}), callback_data: ETradeBtn.reload + '_' + data.mintAddress},
      {text: i18n.__('trade_create_limit_order'), callback_data: 'c_btn'},
    ],
    [{text: i18n.__('trade_fast_buy'), callback_data: 'c_title'}],
    ...transformInlineKeyboard({keyboardList: buyBtnList, colNum: 3}),
    [{text: i18n.__('trade_fast_sell'), callback_data: 'c_title_2'}],
    ...transformInlineKeyboard({keyboardList: sellBtnList, colNum: 3})
  ]

  return {
    message: messageList.join('\n'),
    extra: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboardList
      }
    },
    inlineKeyboardList: inlineKeyboardList,
    poolId: data.poolId,
    symbol: data.currency
  }
}
