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

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
	private logger = new Logger(ChatGateway.name);
	private rooms = new Set<string>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client conectat: ${client.id}`);
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

  @SubscribeMessage('join_room')
  handleJoinRoom(
 	@MessageBody() data: string, 
    @ConnectedSocket() client: Socket
  ): void {
	if (this.rooms.has(data)) {
		this.logger.log(`room ${data} is existing`)

		client.join(data);

	} else {
		this.logger.warn(`room ${data} is not existing`);
		this.rooms.add(data);
		this.logger.log(`room ${data} added`)
	}
  }
}