import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from './entities';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { UpdateMemberDto } from '../auth/dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get(':email')
  async findOneByEmail(
    @Param('email') email: string,
  ): Promise<Member | undefined> {
    return this.membersService.findOneByEmail(email);
  }

  // @Get()
  // findAll() {
  //   return this.membersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.membersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
  //   return this.membersService.update(+id, updateMemberDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.membersService.remove(+id);
  // }
}
