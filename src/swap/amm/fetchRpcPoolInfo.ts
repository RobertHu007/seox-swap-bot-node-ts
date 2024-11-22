import Decimal from 'decimal.js'
import {initSdk} from "../../service/RaydiumService";

export const fetchRpcPoolInfo = async (privateKey: string) => {
  const raydium = await initSdk(privateKey)
  // RAY-SOL
  const pool1 = 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA'
  // RAY-USDC
  const pool2 = '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg'

  const res = await raydium.liquidity.getRpcPoolInfos([pool1, pool2])

  const pool1Info = res[pool1]
  const pool2Info = res[pool2]

  console.log('RAY-SOL pool price:', pool1Info.poolPrice)
  console.log('RAY-USDC pool price:', pool2Info.poolPrice)
  // console.log('amm pool infos:', res)
}

/** uncomment code below to execute */
fetchRpcPoolInfo("")
