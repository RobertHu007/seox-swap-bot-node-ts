import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string; // mint address
  @Column()
  symbol: string; // coin name
  @Column()
  supplyAmount: number; // total amount
  @Column()
  createTime: number; // mint time
}
