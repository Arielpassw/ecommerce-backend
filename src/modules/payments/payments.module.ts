import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';

import { KushkiController } from './kushki/kushki.controller';
import { KushkiService } from './kushki/kushki.service';

import { PaypalController } from './paypal/paypal.controller';
import { PaypalService } from './paypal/paypal.service';

@Module({
  controllers: [
    KushkiController,
    PaypalController,
  ],

  providers: [
    PrismaService,

    KushkiService,

    PaypalService,
  ],
})
export class PaymentsModule {}