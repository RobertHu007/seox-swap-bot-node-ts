
import axios from "axios";
import {HttpsProxyAgent} from "https-proxy-agent";
let env: any = process.env.NODE_ENV;
export const getHttpAgent = () => {
  const proxyOptions = `http://127.0.0.1:7890`;
  return new HttpsProxyAgent(proxyOptions)
}


export const getAxiosClient = ()=> {

  return env === "dev" || env === "test" ? axios.create({
    httpsAgent: getHttpAgent(),
    // headers: {'User-Agent': 'python-requests/2.31.0', 'Accept-Encoding': 'gzip, deflate', 'Accept': '*/*', 'Connection': 'keep-alive'}
  }) : axios.create();
}
