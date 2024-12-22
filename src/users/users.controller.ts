import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Post()
  create(@Body() user: User) {
    return this.usersRepository.save(user);
  }

  @Get()
  findAll() {
    return this.usersRepository.find();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() user: User) {
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.usersRepository.delete(id);
    return { deleted: true };
  }
}
