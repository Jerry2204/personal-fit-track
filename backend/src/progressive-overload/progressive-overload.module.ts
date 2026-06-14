import { Module } from '@nestjs/common';
import { ProgressiveOverloadController } from './progressive-overload.controller';
import { ProgressiveOverloadService } from './progressive-overload.service';

@Module({
  controllers: [ProgressiveOverloadController],
  providers: [ProgressiveOverloadService],
  exports: [ProgressiveOverloadService],
})
export class ProgressiveOverloadModule {}
