import BaseService from "./BaseService";
import {Contract} from "../database/entities/Contract";

export type CreateContractType = Omit<Contract, "id">

class ContractService extends BaseService<Contract> {
  private static ins: ContractService

  static async getInstance() {
    if (!this.ins) {
      this.ins = new ContractService()
    }
    await this.ins.initRepository(Contract)
    return this.ins
  }

  async getContractAddress(address: string) {
    return await this.repository.findOneBy({address})
  }

  async create(data: CreateContractType) {
    const contract = this.repository.create({...data})
    return await this.repository.save(contract)
  }

  async updateById(id: number, updateData: Partial<Contract>) {
    return await this.repository.update({id}, {...updateData})
  }

}

export default ContractService
