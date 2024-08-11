import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Event } from "../entities";

@Injectable()
export class EventsRepository {
    private eventRepository: Repository<Event>;
    constructor(private readonly dataSource: DataSource){
        this.eventRepository = this.dataSource.getRepository(Event);
    }

    async create(event: Event): Promise<Event> {
        return this.eventRepository.save(event);
    }

    async findById(eventId: number): Promise<Event> {
        return this.eventRepository.findOne({
            where: {
                id: eventId,
            },
        });
    }
}
