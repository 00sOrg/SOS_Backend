import { Event } from '../entities';

export class FindEventDto {
    id: number;
    title: string;
    content: string;
    media: string;
    likes: number;
    comments: number;
    createdAt: Date;

    static of(event: Event): FindEventDto {
        const dto = new FindEventDto();
        dto.id = event.id;
        dto.title = event.title;
        dto.content = event.content;
        dto.media = event.media;
        dto.likes = event.likesCount;
        dto.comments = event.commentsCount;
        dto.createdAt = event.createdAt;
        return dto;
    }
}
