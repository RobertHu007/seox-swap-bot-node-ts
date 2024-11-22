import {swap as AMMSwap} from "./amm/swap"
import {swap as CLMMSwap} from "./clmm/swap"
import {swap as CPMMSwap} from "./cpmm/swap"
import {getRaydiumGasFee} from "./utils/gasFeeUtils";
import {initSdk} from "../service/RaydiumService";
import {
  ApiV3PoolInfoConcentratedItem,
  ApiV3PoolInfoItem,
  ApiV3PoolInfoStandardItem,
  ApiV3PoolInfoStandardItemCpmm
} from "@raydium-io/raydium-sdk-v2";
import {isValidAmm} from "./amm/utils";
import {isValidCpmm} from "./cpmm/utils";
import {isValidClmm} from "./clmm/utils";
import SolanaWalletService from "../service/SolanaWalletService";
import {VersionedTransaction} from "@solana/web3.js";

export type TokenToSwapParamsType = {
  poolId: string,
  poolInfo: ApiV3PoolInfoItem
  privateKey: string,
  amountIn: number,
  inputMint: string,
  slippage: number,
}
export const tokenToSwap = async (swapData: TokenToSwapParamsType): Promise<string> => {
  // const raydium = await initSdk(swapData.privateKey)
  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const gasFeeData = await getRaydiumGasFee()
  let swapTransaction: any
  let swapExecute: any
  if (isValidAmm(swapData.poolInfo.programId)) {
    const poolInfoAmm = swapData.poolInfo as ApiV3PoolInfoStandardItem
    const {execute, transaction} = await AMMSwap(swapData.privateKey, poolInfoAmm, swapData.amountIn, swapData.inputMint, swapData.slippage, gasFeeData.m)
    // const st = await solanaWalletUtil.simulateTransaction(transaction)
    swapTransaction = transaction
    swapExecute = execute
  } else if (isValidCpmm(swapData.poolInfo.programId)) {
    const poolInfoCpmm = swapData.poolInfo as ApiV3PoolInfoStandardItemCpmm
    const {execute, transaction} = await CPMMSwap(swapData.privateKey, poolInfoCpmm, swapData.amountIn, swapData.inputMint, swapData.slippage, gasFeeData.m)
    swapTransaction = transaction
    swapExecute = execute
  } else if (isValidClmm(swapData.poolInfo.programId)) {
    const poolInfoClmm = swapData.poolInfo as ApiV3PoolInfoConcentratedItem
    const {execute, transaction} = await CLMMSwap(swapData.privateKey, poolInfoClmm, swapData.amountIn, swapData.inputMint, swapData.slippage, gasFeeData.m)
    swapTransaction = transaction
    swapExecute = execute
  } else {
    return null
  }
  const simulateTxResp = await solanaWalletUtil.simulateTransaction(swapTransaction)
  if (simulateTxResp.err) {
    console.error("模拟交易失败：poolId:", swapData.poolId, " error:--")
    return null
  }
  const {txId} = await swapExecute({sendAndConfirm: false})
  return txId
}
