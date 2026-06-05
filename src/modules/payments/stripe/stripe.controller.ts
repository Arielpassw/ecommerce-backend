import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { StripeService } from './stripe.service';

import { CreateStripeSessionDto } from './dto/create-stripe-session.dto';

@Controller('payments/stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
  ) { }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(
    @Body()
    createStripeCheckoutDto: CreateStripeSessionDto,
  ) {
    return this.stripeService.createCheckoutSession(
      createStripeCheckoutDto,
    );
  }

  @Get('success')
  async stripeSuccess(
    @Query('session_id')
    sessionId: string,
  ) {
    await this.stripeService.handleSuccess(
      sessionId,
    );

    return {
      success: true,
      message:
        'Stripe payment completed successfully',
      sessionId,
    };
  }

  @Get('cancel')
  stripeCancel() {
    return {
      success: false,
      message: 'Stripe payment cancelled',
    };
  }
}