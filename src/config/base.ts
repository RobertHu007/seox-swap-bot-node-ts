import IConfigType from "./configTypes";

export const baseConfig: IConfigType = {
  redis: {
    // host: "45.154.3.97",
    // // host: "api.puman.xyz",
    // port: 6379,
    // password: "iminer!redis123",
    // dbName: 3,
    host: "154.26.130.97",
    // host: "api.puman.xyz",
    port: 6379,
    password: "Bot1!Swap!",
    dbName: 0,
  },
  mysql: {
    type: 'mysql',
    host: '154.26.130.97',
    port: 3306,
    username: 'root',          // 数据库用户名
    password: 'P!ssw9ed!23',      // 数据库密码
    database: 'botswap_dev',          // 数据库名称
    synchronize: true,         // 是否自动同步实体结构到数据库（生产环境建议设为 false）
  },

  BOT_TOKEN: "8097437419:AAHO_pjFdYjNnUTOVZq1Nyj8_PkEe-GM45M",

  WALLET_ADDRESS: "GDzgS7JeJsDtseNpcn1TM369kYCd7uHngnRtiF9PUWMF",
  WALLET_PRIVATE_KEY: "s31FWNj3Nyk1vbfPbLMQo7po2J9wg3EqnaQ5rRDZN5PpAXXYfa97WPCjwCsogGYuxi7s13m4hSFvcPDft4x9wQd",

  CURRENCY_NAME: 'SOL',
}
