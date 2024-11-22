import {initSdk} from "../../service/RaydiumService";


export const fetchRpcPoolInfo = async (privateKey: string) => {
  const raydium = await initSdk(privateKey)
  // SOL-RAY
  const pool1 = '4y81XN75NGct6iUYkBp2ixQKtXdrQxxMVgFbFF9w5n4u'

  const res = await raydium.cpmm.getRpcPoolInfos([pool1])

  const pool1Info = res[pool1]

  console.log('SOL-RAY pool price:', pool1Info.poolPrice)
  console.log('cpmm pool infos:', res)
}

/** uncomment code below to execute */
fetchRpcPoolInfo("")
