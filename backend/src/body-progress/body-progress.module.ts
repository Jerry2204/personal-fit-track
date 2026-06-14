import { Module } from '@nestjs/common';
import { BodyProgressController } from './body-progress.controller';
import { BodyProgressService } from './body-progress.service';

@Module({
  controllers: [BodyProgressController],
  providers: [BodyProgressService],
  exports: [BodyProgressService],
})
export class BodyProgressModule {}
