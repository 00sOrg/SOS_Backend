import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Member } from "./entities";

@Injectable()
export class MembersRepository {
    private memberRepository: Repository<Member>;
    constructor(private readonly dataSource: DataSource){
        this.memberRepository = this.dataSource.getRepository(Member);
    }

    async findById(memberId: number): Promise<Member>{
        return this.memberRepository.findOne({
            where: {
                id: memberId
            }
        });
    }
}