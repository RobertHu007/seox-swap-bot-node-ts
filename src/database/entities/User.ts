// User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {Order} from "./Order";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true })
  privateKey: string;
  @Column({type: "bigint"})
  userId: number;
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
  // 其他字段...
}
