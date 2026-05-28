import { Module } from '@nestjs/common';

import { KushkiController } from './kushki/kushki.controller';
import { KushkiService } from './kushki/kushki.service';

@Module({
  controllers: [KushkiController],
  providers: [KushkiService],
})
export class PaymentsModule {}