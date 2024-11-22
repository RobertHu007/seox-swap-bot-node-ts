// Order.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;
    @Column()
    product: string;
    @Column()
    details: string;
    @ManyToOne(type => User, user => user.orders)
    user: User;

    

    // 其他字段...
}