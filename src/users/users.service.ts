import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findOne(username: string) {
    return this.userRepo.findOne({
      where: { username },
    });
  }

  async findById(id: string) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async create(user: Partial<User>) {
    const newUser = this.userRepo.create(user);
    return this.userRepo.save(newUser);
  }

  async findByResetToken(token: string) {
    return this.userRepo.findOne({
      where: { resetToken: token },
    });
  }

  async updateResetToken(userId: string, token: string, expires: Date) {
    return this.userRepo.update(userId, {
      resetToken: token,
      resetTokenExpires: expires,
    });
  }

  async updatePasswordAndClearReset(userId: string, hashedPassword: string) {
    return this.userRepo.update(userId, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });
  }
}
