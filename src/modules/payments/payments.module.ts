import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';

import { KushkiController } from './kushki/kushki.controller';
import { KushkiService } from './kushki/kushki.service';

import { PaypalController } from './paypal/paypal.controller';
import { PaypalService } from './paypal/paypal.service';

import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';
@Module({
  controllers: [
    KushkiController,
    PaypalController,
    StripeController,
  ],

  providers: [
    PrismaService,
    KushkiService,
    PaypalService,
    StripeService,
  ],
})
export class PaymentsModule {}