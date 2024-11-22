import IConfigType from "./configTypes";
import {baseConfig} from "./base";
import {devConfig} from "./dev";
import {productConfig} from "./product";

const env: string = process.env.NODE_ENV || "dev";
console.log("this evn: ", env)

let conf: IConfigType

if (env === "dev") {
  conf = Object.assign({}, baseConfig, devConfig)
} else if (env === "product") {
  conf = Object.assign({}, baseConfig, productConfig)
}

console.log("config:", conf)
export default conf
