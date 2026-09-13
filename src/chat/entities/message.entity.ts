import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  message: string;

  @Column({ nullable: true }) // Poate fi null dacă e un mesaj global, fără cameră
  room: string;

  @CreateDateColumn()
  createdAt: Date;
}