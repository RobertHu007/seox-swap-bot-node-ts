
import {DataSource, EntityTarget, Repository} from "typeorm";
import config from "../config";
import entities from "./entities";

let {mysql} = config

let _appdataSource:DataSource

let env: any = process.env.NODE_ENV;

const fileExtension = env !== 'dev' ? 'js' : 'ts';
export async function getAppDataSource(): Promise<DataSource> {
  if (!_appdataSource) {
    _appdataSource = new DataSource({
      type: mysql.type,
      host: mysql.host,
      port: mysql.port,
      username: mysql.username,
      password: mysql.password,
      database: mysql.database,
      synchronize: mysql.synchronize,
      entities: entities as any,
      subscribers: [],
      migrations: [],
    })
    await _appdataSource.initialize();
  }
  return _appdataSource
}

export async function getRepository(entityTarget: EntityTarget<any>): Promise<Repository<any>> {
  let dataSource = await getAppDataSource()
  return dataSource.getRepository(entityTarget)
}
