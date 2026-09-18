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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from './utils/events.js';

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
	private logger = new Logger(ChatGateway.name);
	private rooms = new Set<string>();
	private users = new Map<string, string>();

	constructor(
		private readonly chatService: ChatService,
		private eventEmitter: EventEmitter2
	) {

	}

  @WebSocketServer()
  server: Server;

  async getAllRoomsFromDbAndWebSocket() {
	const roomsFromDb: string[] = await this.chatService.getRoomsFromDb();
	const finalRooms = new Set(new Array(...roomsFromDb, ...this.rooms))
	return finalRooms;
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client conectat: ${client.id}`);
	const finalRooms = await this.getAllRoomsFromDbAndWebSocket();
    client.emit('room_created', { rooms: Array.from(finalRooms) })
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
    client.broadcast.emit('mesaj_nou', {...data, createdAt: new Date()});
  }

  @SubscribeMessage('trimite_mesaj_room')
  handleMessageToRoom(
    @MessageBody() data: { room: string, message: string, username: string },
    @ConnectedSocket() client: Socket,
  ): void {
	this.users.set(client.id, data.username);
    this.logger.log(`client ${this.users.get(client.id)} trimite mesajul ${data.message} in room ${data.room}`)
    this.server.to(data.room).emit('mesaj_nou', {mesaj: data.message, username: data.username, createdAt: new Date()});
    this.eventEmitter.emit(Events.saveMessage, data);
  }

  @SubscribeMessage('create_room')
  async handleCreateRoom(
 	@MessageBody() data: string, 
    @ConnectedSocket() client: Socket
  ): Promise<void> {
	  client.join(data);
    this.rooms.add(data);
	await this.chatService.addRoom(data);
    this.logger.log(`Client ${client.id} a creat camera: ${data}`);
	const finalRooms = await this.getAllRoomsFromDbAndWebSocket();
    this.server.emit('room_created', { rooms: Array.from(finalRooms) });
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