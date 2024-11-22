import {
  AMM_STABLE,
  AMM_V4,
  DEVNET_PROGRAM_ID,
  PoolFetchType,
  PoolsApiReturn,
  Raydium
} from "@raydium-io/raydium-sdk-v2";
import {Keypair} from "@solana/web3.js";
import bs58 from 'bs58'
import SolanaWalletService from "./SolanaWalletService";
import {getAxiosClient, getHttpAgent} from "../utils/networkUtils";

let env: any = process.env.NODE_ENV;

let raydium: Raydium | undefined
export const initSdk = async (privateKey: string, params?: { loadToken?: boolean }) => {
  //if (raydium) return raydium
  //console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`)
  const solanaWalletUtil = await SolanaWalletService.getInstance()
  const owner: Keypair = Keypair.fromSecretKey(bs58.decode(privateKey))

  raydium = await Raydium.load({
    owner,
    connection: solanaWalletUtil.getConnection(),
    cluster: "mainnet",
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
    blockhashCommitment: 'finalized',
    // urlConfigs: {
    //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
    // },
  })
  if (env === "dev" || env === "test") {
    raydium.api.api.defaults.httpsAgent = getHttpAgent()
  }
  /**
   * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
   * if you want to handle token account by yourself, set token account data after init sdk
   * code below shows how to do it.
   * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
   */

  /*
  raydium.account.updateTokenAccount(await fetchTokenAccountData())
  connection.onAccountChange(owner.publicKey, async () => {
    raydium!.account.updateTokenAccount(await fetchTokenAccountData())
  })
  */

  return raydium
}

class RaydiumService {

  private raydium: Raydium;
  private static ins: RaydiumService

  static async getInstance(privateKey: string, params?: { loadToken?: boolean }) {
    if (!this.ins) {
      this.ins = new RaydiumService()
    }
    await this.ins.initRaydiumSDK(privateKey, params)
    return this.ins
  }

  getRaydium() {
    return this.raydium
  }

  async initRaydiumSDK(privateKey: string, params?: { loadToken?: boolean }) {
    const solanaWalletUtil = await SolanaWalletService.getInstance()
    if (privateKey) {
      const owner: Keypair = Keypair.fromSecretKey(bs58.decode(privateKey))
      this.raydium = await Raydium.load({
        owner,
        connection: solanaWalletUtil.getConnection(),
        cluster: "mainnet",
        // cluster: "devnet",
        disableFeatureCheck: true,
        disableLoadToken: !params?.loadToken,
        blockhashCommitment: 'finalized',
      })
    }
    this.raydium = await Raydium.load({
      connection: solanaWalletUtil.getConnection(),
      cluster: "mainnet",
      // cluster: "devnet",
      disableFeatureCheck: true,
      disableLoadToken: !params?.loadToken,
      blockhashCommitment: 'finalized',
    })
    if (env === "dev") {
      this.raydium.api.api.defaults.httpsAgent = getHttpAgent()
    }
    // this.raydium.api.api.defaults.httpsAgent = getHttpAgent()
  }

  async getContractPoolInfo(mintAddress: string, type: PoolFetchType): Promise<PoolsApiReturn> {
    return await this.raydium.api.fetchPoolByMints({
      mint1: mintAddress,
      mint2: 'So11111111111111111111111111111111111111112',
      type: type
    })
  }

  async getTokenInfo(mintAddress: string) {
    return await this.raydium.api.getTokenInfo([mintAddress])
  }

  async getTokenPriceMap() {
    try {
      const response = await getAxiosClient().get("https://api.raydium.io/v2/main/price")
      return response.data
    } catch (e) {
      console.log(e)
      return {}
    }
  }
}

export default RaydiumService
