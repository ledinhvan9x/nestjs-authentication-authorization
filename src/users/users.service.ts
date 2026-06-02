import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async create(user: any) {
    this.users.push(user);
    return user;
  }

  async findById(userId: number) {
    return this.users.find((u) => u.userId === userId);
  }
}
