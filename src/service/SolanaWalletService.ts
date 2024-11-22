import {
  AccountInfo,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey, RpcResponseAndContext, SimulatedTransactionResponse,
  Transaction, VersionedTransaction
} from "@solana/web3.js";
import bs58 from 'bs58';

export interface IGenerateWalletType {
  address: string,
  privateKey: string
}

export type AccountResDataType = {
  status: boolean,
  accountInfo?: AccountInfo<Buffer>
}

export type MintInfoType = {
  decimals: number,
  freezeAuthority: any,
  isInitialized: boolean,
  mintAuthority: boolean,
  supply: string
}

let env: any = process.env.NODE_ENV;

class SolanaWalletService {
  private connection: Connection
  private static ins: SolanaWalletService
  static async getInstance() {
    if (!this.ins) {
      this.ins = new SolanaWalletService()
      this.ins.initConnection()
    }
    return this.ins
  }

  initConnection() {
    if (env === "dev" || env === "test") {
      this.connection = new Connection("https://solana.publicnode.com/")
    } else {
      this.connection = new Connection(clusterApiUrl("mainnet-beta"))
    }
    // this.connection = new Connection(clusterApiUrl("mainnet-beta"))
    // this.connection = new Connection("https://devnet.helius-rpc.com/?api-key=92b9487a-ae6d-451c-840d-5f75d71adda7")

  }

  getConnection(): Connection {
    return this.connection
  }

  async getSolBalance(publicKey: string): Promise<number> {
    const balance = await this.connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL; // 转换为 SOL
    // return 0
  }

  async getTokenBalance(publicKey: string, mintAddress: string): Promise<number> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        new PublicKey(publicKey),
        {
          mint: new PublicKey(mintAddress)
        }
      )
      if (tokenAccounts.value.length > 0) {
        const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info
        const balance = tokenAccountInfo.tokenAmount.uiAmount
        return balance
      }
      return 0
    } catch (e) {
      return 0
    }
  }

  generateWallet(): IGenerateWalletType {
    const keypair = Keypair.generate();
    const privateKey = keypair.secretKey;
    const base58PrivateKey = bs58.encode(privateKey);
    const publicKey = keypair.publicKey.toBase58();
    return {
      address: publicKey,
      privateKey: base58PrivateKey
    }
  }

  importWallet(privateKeyBase58: string): IGenerateWalletType {
    const privateKey = bs58.decode(privateKeyBase58);
    // 3. 通过私钥生成 Keypair
    const keypair = Keypair.fromSecretKey(privateKey);
    // 4. 获取公钥（即地址）
    const publicKey = keypair.publicKey.toBase58();
    return {
      address: publicKey,
      privateKey: privateKeyBase58
    }
  }

  isValidAddress(address: string) {
    try {
      const publicKey = new PublicKey(address);
      const isOnCurve = PublicKey.isOnCurve(publicKey.toBuffer());
      return isOnCurve
    } catch (e) {
      return false
    }
  }

  async getTokenAmountInfo(publicKey: string) {
    const tokenInfoRes = await this.connection.getTokenSupply(new PublicKey(publicKey))
    const tokenInfo = tokenInfoRes.value
    return tokenInfo
  }

  async accountInfo(address: string): Promise<AccountResDataType> {
    try {
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(address))
      if (!accountInfo) {
        return {
          status: false,
          accountInfo: null
        }
      }
      return {
        status: true,
        accountInfo: accountInfo
      }
    } catch (e) {
      return {
        status: false,
        accountInfo: null
      }
    }
  }

  async getMintInfo(mintAddress: string): Promise<MintInfoType|null> {
    try {
      const mintInfo = await this.connection.getParsedAccountInfo(new PublicKey(mintAddress))
      console.log("mintInfo", mintInfo)
      const data = mintInfo.value.data
      if (data && data['parsed']) {
        return data['parsed'].info as MintInfoType
      }
      return null
    } catch (e) {
      return null
    }
  }

  async getTokenCreationTime(mintAddress: string): Promise<number> {
    try {
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(mintAddress))
      if (!accountInfo) {
        return 0
      }
      const createdSlot = accountInfo.lamports
      const blockTime = await this.connection.getBlockTime(createdSlot)
      return blockTime
    } catch (e) {
      return 0
    }
  }

  async getTokenTop10Amount(mintAddress: string): Promise<number> {
    try {
      const largestAccounts = await this.connection.getTokenLargestAccounts(new PublicKey(mintAddress))
      const top10 = largestAccounts.value.slice(0, 10);
      let allAmount = 0
      top10.forEach((accountInfo) => {
        allAmount += Number(accountInfo.amount)
      })
      return allAmount
    } catch (e) {
      return 0
    }
  }


  async simulateTransaction(transaction: VersionedTransaction) {
      try {
        const simulatedResp: RpcResponseAndContext<SimulatedTransactionResponse> = await this.connection.simulateTransaction(transaction)
        console.log("simulatedResp:", simulatedResp.value)
        return simulatedResp.value
      } catch (e) {
        throw e
      }

  }

}

export default SolanaWalletService
