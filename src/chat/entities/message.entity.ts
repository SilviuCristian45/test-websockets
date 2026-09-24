import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity.js';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  message: string;

  @ManyToOne(() => Room, (r) => r.messages, { nullable: true })
  @JoinColumn()
  room: Room | null;

  @CreateDateColumn()
  createdAt: Date;
}
