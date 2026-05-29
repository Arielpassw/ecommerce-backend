import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { PaypalService } from './paypal.service';

import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

@Controller('payments/paypal')
@UseGuards(JwtAuthGuard)
export class PaypalController {
  constructor(
    private readonly paypalService: PaypalService,
  ) {}

  @Post('create-order')
  createOrder(
    @Body()
    createPaypalOrderDto: CreatePaypalOrderDto,
  ) {
    return this.paypalService.createOrder(
      createPaypalOrderDto,
    );
  }

  @Post('capture-order')
  captureOrder(
    @Body()
    capturePaypalOrderDto: CapturePaypalOrderDto,
  ) {
    return this.paypalService.captureOrder(
      capturePaypalOrderDto,
    );
  }

  @Get('success')
  paypalSuccess(
    @Query('token') token: string,

    @Query('PayerID') payerId: string,
  ) {
    return {
      success: true,

      message:
        'PayPal payment approved successfully',

      token,

      payerId,
    };
  }

  @Get('cancel')
  paypalCancel() {
    return {
      success: false,

      message:
        'PayPal payment cancelled',
    };
  }
}