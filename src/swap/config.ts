import {parseTokenAccountResp, TxVersion} from "@raydium-io/raydium-sdk-v2";
import SolanaWalletService from "../service/SolanaWalletService";
import {Keypair, PublicKey} from "@solana/web3.js";
import bs58 from "bs58";
import {TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID} from "@solana/spl-token";

export const txVersion = TxVersion.V0 // or TxVersion.LEGACY

export const fetchTokenAccountData = async (address: string) => {
  const owner: Keypair = Keypair.fromSecretKey(bs58.decode(address))
  const solanaWalletUtils = await SolanaWalletService.getInstance()
  const solAccountResp = await solanaWalletUtils.getConnection().getAccountInfo(owner.publicKey)
  const tokenAccountResp = await solanaWalletUtils.getConnection().getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_PROGRAM_ID })
  const token2022Req = await solanaWalletUtils.getConnection().getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
  const tokenAccountData = parseTokenAccountResp({
    owner: owner.publicKey,
    solAccountResp,
    tokenAccountResp: {
      context: tokenAccountResp.context,
      value: [...tokenAccountResp.value, ...token2022Req.value],
    },
  } as any)
  return tokenAccountData
}
