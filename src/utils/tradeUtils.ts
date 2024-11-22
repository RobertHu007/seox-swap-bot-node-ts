import {User} from "../database/entities/User";
import config from "../config";
import {ApiV3PoolInfoItem, ApiV3Token, PoolFetchType} from "@raydium-io/raydium-sdk-v2";
import {TradeParamsType} from "../bot/utils/messageUtils";
import SolanaWalletService from "../service/SolanaWalletService";
import RaydiumService, {initSdk} from "../service/RaydiumService";
import {formatDurationDHM} from "./timeFormatUtils";
import {Context} from "telegraf";
import {getRedisClient} from "../database/redisDB";
import {getAxiosClient} from "./networkUtils";
import {GasFeeDataType, TradeMessageInfoType} from "../types";
import {NATIVE_MINT} from "@solana/spl-token";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {tokenToSwap} from "../swap";

type TradeInfoType = {
  tradeInfo: TradeParamsType,
  poolInfo: ApiV3PoolInfoItem
}
export const getTradeInfo = async (userInfo: User, mintAddress: string, tokenInfo: ApiV3Token[]): Promise<TradeInfoType> => {
  const {CURRENCY_NAME} = config
  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const raydiumUtil = await RaydiumService.getInstance(userInfo.privateKey)

  // const accountInfo = accountInfoRes.accountInfo

  // const mintAddress = text.trim()

  const tokenPriceMap = await raydiumUtil.getTokenPriceMap()

  const solPrice = tokenPriceMap['So11111111111111111111111111111111111111112']

  const poolInfo = await raydiumUtil.getContractPoolInfo(mintAddress, PoolFetchType.All)

  let concentratedData: ApiV3PoolInfoItem

  console.log("pollInfoList:", poolInfo.data)

  for (const item of poolInfo.data) {
    if (concentratedData) {
      if (concentratedData.tvl < item.tvl) {
        concentratedData = item
      }
    } else {
      concentratedData = item
    }
  }

  if (!concentratedData) return

  // const tokenAmountInfo = await solanaWalletUtil.getTokenAmountInfo(text)

  const mintInfo = await solanaWalletUtil.getMintInfo(mintAddress)

  // const contractSolBalance = await solanaWalletUtil.getSolBalance(mintAddress)

  console.log('poolInfo:', concentratedData)

  console.log('mintInfo:', mintInfo)
  if (!mintInfo) return

  const supplyAmount = Number(mintInfo.supply) / mintInfo.decimals

  const top10Amount = await solanaWalletUtil.getTokenTop10Amount(mintAddress)

  // const tokenCreationTime = await solanaWalletUtil.getTokenCreationTime(mintAddress)
  //
  // console.log("createTime:", tokenCreationTime)

  const tokenCreationTimeStr = formatDurationDHM(Number(concentratedData.openTime) * 1000)

  let walletSOLBalance = 0
  let walletTokenBalance = 0
  let destroyAmount = 0
  if (userInfo.address) {
    walletTokenBalance = await solanaWalletUtil.getTokenBalance(userInfo.address, mintAddress)
    walletSOLBalance = await solanaWalletUtil.getSolBalance(userInfo.address)
    // destroyAmount = await solanaWalletUtil.getTokenBalance('')
  }

  // const testNum = (concentratedData.tvl) / solPrice

  let currencyPrice = 0
  if (concentratedData.mintA.address === mintAddress) {
    currencyPrice = concentratedData.price * solPrice
  } else {
    currencyPrice = 1 / concentratedData.price * solPrice
  }

  const tradeInfo: TradeParamsType = {
    mainCurrency: CURRENCY_NAME,
    currency: tokenInfo[0].symbol,
    currencyDecimals: mintInfo.decimals,
    mainCurrencyPrice: solPrice,
    currencyPrice: currencyPrice,
    mintAddress: mintAddress,
    tvlAmount: concentratedData.tvl / solPrice,
    marketCap: currencyPrice * supplyAmount,
    notMintAuthority: mintInfo.mintAuthority === null,
    notFreezeAuthority: mintInfo.freezeAuthority === null,
    creationTime: tokenCreationTimeStr,
    top10Percent: (top10Amount / mintInfo.decimals) / supplyAmount * 100,
    solBalance: walletSOLBalance,
    tokenBalance: walletTokenBalance / mintInfo.decimals,
    poolPrice: concentratedData.price,
    poolId: concentratedData.id
  }
  return {
    tradeInfo: tradeInfo,
    poolInfo: concentratedData
  }
}


export const tradeSwap = async (ctx: Context, actionTypeStr: string, mintAddress: string, userInfo: User, lastActionStr: string|number, messageId: number) => {
  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const redisClient = getRedisClient()
  const isTradeAction = actionTypeStr === 'buy'   // true 买   false 卖
  let inputMint = ""
  let amountIn = 0
  const gasFeeDataResp = await getAxiosClient().get('https://api-v3.raydium.io/main/auto-fee')
  let gasFeeData = gasFeeDataResp.data['data']['default'] as GasFeeDataType

  const raydium = await initSdk(userInfo.privateKey)

  if (!gasFeeData) {
    gasFeeData = {vh: 50000, h: 50000, m: 50000}
  }

  if (isTradeAction) {
    // const mintInfo = await solanaWalletUtil.getMintInfo(mintAddress)
    inputMint = NATIVE_MINT.toBase58()
    const walletSOLBalance = await solanaWalletUtil.getSolBalance(userInfo.address)
    if (typeof lastActionStr === 'string') {
      const solPriceMap = {
        "1": 0.1,
        "2": 0.5,
        "3": 1,
        "4": 2,
        "5": 5
      }
      amountIn = solPriceMap[lastActionStr] * LAMPORTS_PER_SOL
    } else {
      amountIn = lastActionStr * LAMPORTS_PER_SOL
    }
    if (amountIn > (walletSOLBalance * LAMPORTS_PER_SOL)) {
      ctx.reply("⚠️ SOL余额不足，建议充值或者调低交易金额\n当前钱包余额 < 交易gas优先费+交易手续费+交易金额")
      return
    }
    const tradeMessageInfoByDB = await redisClient.get(`tradeMessageIdInfo:${messageId}`)
    if (tradeMessageInfoByDB) {
      const tradeMessageInfo = JSON.parse(tradeMessageInfoByDB) as TradeMessageInfoType
      ctx.reply(`⚡️ 买入 ${tradeMessageInfo.symbol} ${amountIn / LAMPORTS_PER_SOL} SOL`)
      // const url = await swapClmm()
      const poolInfoList = await raydium.api.fetchPoolById({ids: tradeMessageInfo.poolId})
      if (poolInfoList.length === 0) {
        return ctx.reply("暂时没有找到这个交易对")
      }
      const poolInfo = poolInfoList[0]
      const txId = await tokenToSwap({
        poolId: poolInfo.id,
        poolInfo: poolInfo,
        privateKey: userInfo.privateKey,
        amountIn: amountIn,
        inputMint: inputMint,
        slippage: 0.2
      })
      if (!txId) {
        return ctx.reply("❌交易失败")
      }
      return ctx.reply("✅交易成功：" + `https://explorer.solana.com/tx/${txId}`)
    }
  } else {
    inputMint = new PublicKey(mintAddress).toBase58()
    const sellPercentNum = Number(lastActionStr)
    const walletTokenBalance = await solanaWalletUtil.getTokenBalance(userInfo.address, mintAddress)
    if (walletTokenBalance) {
      const tradeMessageInfoByDB = await redisClient.get(`tradeMessageIdInfo:${messageId}`)
      if (!tradeMessageInfoByDB) {
        ctx.reply("暂无交易")
        return
      }
      const tradeMessageInfo = JSON.parse(tradeMessageInfoByDB) as TradeMessageInfoType
      const poolInfoList = await raydium.api.fetchPoolById({ids: tradeMessageInfo.poolId})
      if (poolInfoList.length === 0) {
        return ctx.reply("暂时没有找到这个交易对")
      }
      const poolInfo = poolInfoList[0]
      amountIn = walletTokenBalance * (sellPercentNum / 100) * (10 ** tradeMessageInfo.decimals)
      ctx.reply(`⚡️ 卖出 ${sellPercentNum}% ${tradeMessageInfo.symbol}`)

      const txId = await tokenToSwap({
        poolId: poolInfo.id,
        poolInfo: poolInfo,
        privateKey: userInfo.privateKey,
        amountIn: amountIn,
        inputMint: inputMint,
        slippage: 0.2
      })
      if (!txId) {
        return ctx.reply("❌交易失败")
      }
      return ctx.reply("✅交易成功：" + `https://explorer.solana.com/tx/${txId}`)

    } else {
      ctx.reply("未查询到代币持仓")
    }
  }
}
