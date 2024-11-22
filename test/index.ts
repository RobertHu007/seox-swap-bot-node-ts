import {swap as AMMSwap} from "../src/swap/amm/swap"
import {ApiV3PoolInfoStandardItem} from "@raydium-io/raydium-sdk-v2";
import {initSdk} from "../src/service/RaydiumService";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {NATIVE_MINT} from "@solana/spl-token";
import {getRaydiumGasFee} from "../src/swap/utils/gasFeeUtils";
import SolanaWalletService from "../src/service/SolanaWalletService";


const start = async () => {
  const gasFeeData = await getRaydiumGasFee()
  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const privateKey = "585ZnZ15fah2Nb2Nav1BoeyP5gaJDcnRxnq85MWrz7e52te8LvP2LEYKnVXCLxpzfG5RSawQtqpz11pd8xieAyd5"
  const raydium = await initSdk(privateKey)
  const poolId = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
  const data = await raydium.api.fetchPoolById({ ids: poolId })
  const poolInfo = data[0] as ApiV3PoolInfoStandardItem

  const amountIn = 0.2 * LAMPORTS_PER_SOL

  const inputMint = NATIVE_MINT.toBase58()

  const {transaction} = await AMMSwap(privateKey, poolInfo, amountIn, inputMint, 0.2, gasFeeData.m)

  await solanaWalletUtil.simulateTransaction(transaction)

}


start()

