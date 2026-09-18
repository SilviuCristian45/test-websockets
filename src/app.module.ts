import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ChatModule } from './chat/chat.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './chat/entities/message.entity.js';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
	EventEmitterModule.forRoot(),
	TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'chat_user',
      password: 'chat_password',
      database: 'chat_db',
      entities: [Message],
      synchronize: true,
    }),
	ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
