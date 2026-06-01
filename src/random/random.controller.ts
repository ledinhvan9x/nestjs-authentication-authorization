import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RandomService } from './random.service';
import { CreateRandomDto } from './dto/create-random.dto';
import { UpdateRandomDto } from './dto/update-random.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(RolesGuard)
@Controller('random')
export class RandomController {
  constructor(private readonly randomService: RandomService) {}

  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createRandomDto: CreateRandomDto) {
    return this.randomService.create(createRandomDto);
  }

  @Roles(Role.Admin)
  @Get()
  findAll() {
    return this.randomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.randomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRandomDto: UpdateRandomDto) {
    return this.randomService.update(+id, updateRandomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.randomService.remove(+id);
  }
}
