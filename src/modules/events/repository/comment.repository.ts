import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Comment } from "../entities";

@Injectable()
export class CommentRepository{
    private commentRepository: Repository<Comment>;
    constructor(private readonly dataSource: DataSource){
        this.commentRepository = this.dataSource.getRepository(Comment);
    }

    async create(comment: Comment): Promise<Comment> {
        return this.commentRepository.save(comment);
    }
}