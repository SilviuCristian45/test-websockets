import { Injectable, Logger } from '@nestjs/common';
import { And, Equal, IsNull, Or, Repository } from 'typeorm';
import { Message } from './entities/message.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from './utils/events.js';
import { Room } from './entities/room.entity.js';

@Injectable()
export class ChatService {
  async addRoom(data: string) {
    try {
      const room = new Room();
      room.name = data;
      await this.roomRepository.save(room);
      this.logger.log(`room ${data} added success`);
    } catch (err) {
      this.logger.error(err);
    }
  }

  private logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Message) private readonly repository: Repository<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  @OnEvent(Events.saveMessage)
  public async saveMessage(data: {
    room: string;
    message: string;
    username: string;
  }) {
    try {
      const room = await this.roomRepository.findOne({
        where: { name: data.room },
      });
      const newMessage = this.repository.create({
        username: data.username,
        message: data.message,
        room,
      });
      await this.repository.save(newMessage); // Așteptăm salvarea
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async getRoomsFromDb() {
    try {
      const rooms = await this.roomRepository.find();
      const roomsArray = rooms.map((item) => item.name);
      return roomsArray;
    } catch (err) {
      this.logger.error(err);
      return [];
    }
  }

  public async getMessagesForRoom(room: string | null | undefined) {
    try {
      const whereCondition = room
        ? { room: { name: room } }
        : { room: IsNull() };
      return await this.repository.find({
        where: whereCondition,
        relations: { room: true },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    } catch (err) {
      this.logger.error(err);
      return [];
    }
  }
}
