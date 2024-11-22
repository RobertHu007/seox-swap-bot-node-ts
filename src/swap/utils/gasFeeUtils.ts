import {GasFeeDataType} from "../../types";
import {getAxiosClient} from "../../utils/networkUtils";


export const getRaydiumGasFee = async (): Promise<GasFeeDataType> => {
  const gasFeeDataResp = await getAxiosClient().get('https://api-v3.raydium.io/main/auto-fee')
  let gasFeeData = gasFeeDataResp.data['data']['default'] as GasFeeDataType

  return gasFeeData
}
