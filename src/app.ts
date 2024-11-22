import {DataSource} from "typeorm";
import {getAppDataSource} from "./database/db";


class App {
  appdataSource: DataSource
  async start(){
    await this.bindMysql()
  }

  private bindMysql() {
    return new Promise<void>((resolve) => {
      getAppDataSource().then((dataSource) => {
        this.appdataSource = dataSource
        resolve()
        console.log("mysql connect success");
      })
    })
  }
}

export default App
