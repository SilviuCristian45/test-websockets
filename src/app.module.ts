import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ChatModule } from './chat/chat.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './chat/entities/message.entity.js';

@Module({
  imports: [
	TypeOrmModule.forRoot({
      type: 'better-sqlite3', // <--- Trucul este aici!
      database: 'chat_baza_de_date.sqlite',
      entities: [Message],
      synchronize: true,
    }),
	ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
