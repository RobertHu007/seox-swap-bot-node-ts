
interface IConfigBase {
  // redis
  redis: {
    host: string;
    port: number;
    password?: string;
    dbName?: number;
  };
  // mysql
  mysql: {
    type: any,
    host: string,
    port: number,
    username: string,          // 数据库用户名
    password: string,      // 数据库密码
    database: string,          // 数据库名称
    synchronize: boolean,         // 是否自动同步实体结构到数据库（生产环境建议设为 false）
  },
}

interface IConfigDynamic {
  /**电报机器人 api码 */
  BOT_TOKEN: string;
  CURRENCY_NAME: string;
  WALLET_PRIVATE_KEY: string;
  WALLET_ADDRESS: string
}

interface IConfigType extends IConfigBase, IConfigDynamic {}

export default IConfigType
