import { Logger } from '@nestjs/common';
import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service.js';

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
	private logger = new Logger(ChatGateway.name);
	private rooms = new Set<string>();

	constructor(
		private readonly chatService: ChatService
	) {

	}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client conectat: ${client.id}`);
    client.emit('room_created', { rooms: Array.from(this.rooms) })
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client deconectat: ${client.id}`);
  }

  @SubscribeMessage('trimite_mesaj')
  handleMessage(
    @MessageBody() data: {mesaj: string, username: string}, 
    @ConnectedSocket() client: Socket
  ): void {
	const { mesaj, username } = data;
    this.logger.log(`Mesaj primit de la ${client.id} cu username ${username}:`, mesaj);

    // Trimitem mesajul tuturor celor conectați
    client.broadcast.emit('mesaj_nou', data);
  }

  @SubscribeMessage('trimite_mesaj_room')
  handleMessageToRoom(
    @MessageBody() data: { room: string, message: string, username: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`client ${client.id} trimite mesajul ${data.message} in room ${data.room}`)
	this.chatService.saveMessage(data);
    this.server.to(data.room).emit('mesaj_nou', {mesaj: data.message, username: data.username});
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
 	@MessageBody() data: string, 
    @ConnectedSocket() client: Socket
  ): void {
	  client.join(data);
    this.rooms.add(data);
    this.logger.log(`Client ${client.id} a creat camera: ${data}`);
    this.server.emit('room_created', { rooms: Array.from(this.rooms) });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket
  ): void {
    client.join(data);
    this.logger.log(`Client ${client.id} a intrat în camera: ${data}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket
  ): void {
    client.leave(data);
    this.logger.log(`Client ${client.id} a părăsit camera: ${data}`);
  }
}