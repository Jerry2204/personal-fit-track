import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ShoesService } from './shoes.service';
import { CreateShoeDto } from './dto/create-shoe.dto';
import { UpdateShoeDto } from './dto/update-shoe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shoes')
@UseGuards(JwtAuthGuard)
export class ShoesController {
  constructor(private readonly shoesService: ShoesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.shoesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.shoesService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateShoeDto, @CurrentUser() user: { id: string }) {
    return this.shoesService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShoeDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.shoesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.shoesService.remove(id, user.id);
  }

  @Patch(':id/retire')
  retire(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.shoesService.retire(id, user.id);
  }
}
