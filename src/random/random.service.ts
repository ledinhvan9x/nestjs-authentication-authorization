import { Injectable } from '@nestjs/common';
import { CreateRandomDto } from './dto/create-random.dto';
import { UpdateRandomDto } from './dto/update-random.dto';

@Injectable()
export class RandomService {
  create(createRandomDto: CreateRandomDto) {
    console.log(createRandomDto);
    return 'This action adds a new random';
  }

  findAll() {
    return `This action returns all random`;
  }

  findOne(id: number) {
    return `This action returns a #${id} random`;
  }

  update(id: number, updateRandomDto: UpdateRandomDto) {
    console.log(updateRandomDto);
    return `This action updates a #${id} random`;
  }

  remove(id: number) {
    return `This action removes a #${id} random`;
  }
}
