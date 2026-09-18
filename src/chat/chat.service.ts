import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { OnEvent } from "@nestjs/event-emitter";
import { Events } from "./utils/events.js";

@Injectable()
export class ChatService {

	private logger = new Logger(ChatService.name);
	
	constructor(
		@InjectRepository(Message) private readonly repository: Repository<Message>
	) {

	}


	@OnEvent(Events.saveMessage)
	public async saveMessage(data: { room: string, message: string, username: string }) {
		try {
			const newMessage = this.repository.create({
				username: data.username,
				message: data.message,
				room: data.room
				});
    		await this.repository.save(newMessage); // Așteptăm salvarea
		} catch(err) {
			this.logger.error(err);
		}
	}
}