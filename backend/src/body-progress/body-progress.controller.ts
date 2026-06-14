import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BodyProgressService } from './body-progress.service';
import { CreateBodyProgressDto } from './dto/create-body-progress.dto';
import { UpdateBodyProgressDto } from './dto/update-body-progress.dto';
import { QueryBodyProgressDto } from './dto/query-body-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('body-progress')
@UseGuards(JwtAuthGuard)
export class BodyProgressController {
  constructor(private readonly bodyProgressService: BodyProgressService) {}

  @Post()
  create(
    @Body() dto: CreateBodyProgressDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.bodyProgressService.create(dto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryBodyProgressDto,
  ) {
    return this.bodyProgressService.findAll(user.id, query);
  }

  @Get('latest')
  findLatest(@CurrentUser() user: { id: string }) {
    return this.bodyProgressService.findLatest(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bodyProgressService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBodyProgressDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.bodyProgressService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bodyProgressService.remove(id, user.id);
  }
}
