import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save and return user (excluding password)
    const savedUser = await this.usersRepository.save(user);
    delete savedUser.password;
    return savedUser;
  }

  @Get()
  async findAll() {
    const users = await this.usersRepository.find();
    // Remove passwords from response
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);

    // Return updated user (excluding password)
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    delete updatedUser.password;
    return updatedUser;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.usersRepository.delete(id);
    return { deleted: true };
  }
}
