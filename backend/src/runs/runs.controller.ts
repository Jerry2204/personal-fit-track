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
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { QueryRunDto } from './dto/query-run.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post()
  create(
    @Body() dto: CreateRunDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.runsService.create(dto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryRunDto,
  ) {
    return this.runsService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.runsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRunDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.runsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.runsService.remove(id, user.id);
  }
}
