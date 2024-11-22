import {EntityTarget, Repository} from "typeorm";
import {getRepository} from "../database/db";


abstract class BaseService<TModel> {
  repository: Repository<TModel>

  protected constructor() {}

  protected async initRepository(entityTarget: EntityTarget<TModel>) {
    this.repository = await getRepository(entityTarget)
  }

}

export default BaseService
