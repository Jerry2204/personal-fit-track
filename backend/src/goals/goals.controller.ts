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
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @Body() dto: CreateGoalDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.create(dto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryGoalDto,
  ) {
    return this.goalsService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.update(id, user.id, dto);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.complete(id, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.remove(id, user.id);
  }
}
