import {Context, MiddlewareFn, NarrowedContext} from "telegraf";
import {MountMap} from "telegraf/typings/telegram-types";
import SolanaWalletService from "../../service/SolanaWalletService";
import config from "../../config";
import RaydiumService from "../../service/RaydiumService";
import {ApiV3PoolInfoItem, PoolFetchType} from "@raydium-io/raydium-sdk-v2";
import {tokenToSwap} from "../../swap";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {NATIVE_MINT} from "@solana/spl-token";

const {CURRENCY_NAME, WALLET_ADDRESS, WALLET_PRIVATE_KEY} = config

const checkWalletAddressFunc: MiddlewareFn<
  NarrowedContext<Context, MountMap["text"]>
> = async (ctx, next) => {
  const text: string = ctx.message.text;

  const tgId: number = ctx.from.id;

  const i18n = process["i18n"]

  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const isValidAddress = await solanaWalletUtil.isValidAddress(text)
  if (!isValidAddress) return next()

  const raydiumUtil = await RaydiumService.getInstance(WALLET_PRIVATE_KEY)

  const poolInfoIdOrMintAddress = text.trim()

  const poolInfoList = await raydiumUtil.getContractPoolInfo(poolInfoIdOrMintAddress, PoolFetchType.All)

  // const walletBalance = await solanaWalletUtil.getSolBalance(WALLET_ADDRESS)

  const buySEOXSOLAmount = 5 * LAMPORTS_PER_SOL

  try {
    if (poolInfoList.data.length === 0) {
      ctx.reply("这个不是Mint Address， 接下来进行池子ID查看")
      const poolInfoList = await raydiumUtil.getRaydium().api.fetchPoolById({ids: poolInfoIdOrMintAddress})
      if (poolInfoList.length > 0) {
        const poolInfo = poolInfoList[0]
        ctx.reply(`发现池子: ${poolInfo.mintA.symbol}/${poolInfo.mintB.symbol}，正在进行交易`)
        const txId = await tokenToSwap({
          poolId: poolInfo.id,
          poolInfo: poolInfo,
          privateKey: WALLET_PRIVATE_KEY,
          amountIn: buySEOXSOLAmount,
          inputMint: NATIVE_MINT.toBase58(),
          slippage: 0.1
        })
        if (!txId) {
          return ctx.reply("❌交易失败")
        }
        return ctx.reply("✅交易成功：" + `https://explorer.solana.com/tx/${txId}`)
      } else {
        ctx.reply("池子未找到，暂停交易，再次发送重新调起交易！")
      }
      return
    }
    let poolInfo: ApiV3PoolInfoItem
    for (const item of poolInfoList.data) {
      if (poolInfo) {
        if (poolInfo.tvl < item.tvl) {
          poolInfo = item
        }
      } else {
        poolInfo = item
      }
    }
    ctx.reply(`已找到这个Mint Address 池子: ${poolInfo.mintA.symbol}/${poolInfo.mintB.symbol}， 正在进行交易`)
    const txId = await tokenToSwap({
      poolId: poolInfo.id,
      poolInfo: poolInfo,
      privateKey: WALLET_PRIVATE_KEY,
      amountIn: buySEOXSOLAmount,
      inputMint: NATIVE_MINT.toBase58(),
      slippage: 0.1
    })
    if (!txId) {
      return ctx.reply("❌交易失败")
    }
    return ctx.reply("✅交易成功：" + `https://explorer.solana.com/tx/${txId}`)
  } catch (e) {
    return ctx.reply("❌交易失败")
  }



}

export default checkWalletAddressFunc
