import {Repository} from "typeorm";
import { User } from '../database/entities/User';
import BaseService from "./BaseService";

class UserService extends BaseService<User>{
  private static ins: UserService

  static async getInstance() {
    if (!this.ins) {
      this.ins = new UserService()
    }
    await this.ins.initRepository(User)
    return this.ins
  }

  async createUser(userId:number,name:string,address: string, privateKey: string) {
    const user = this.repository.create({userId, name, address, privateKey})
    return await this.repository.save(user)
  }

  async getUserById(id: number) {
    return await this.repository.findOneBy({ userId: id });
  }

  async updateUser(userId: number, updateData: Partial<User>) {
    return await this.repository.update({userId}, { ...updateData })
  }

}

export default UserService
