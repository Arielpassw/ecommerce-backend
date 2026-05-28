import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import axios from 'axios';

import { PrismaService } from '../../../database/prisma/prisma.service';

import { CreateKushkiChargeDto } from './dto/create-kushki-charge.dto';

@Injectable()
export class KushkiService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createCharge(
    createKushkiChargeDto: CreateKushkiChargeDto,
  ) {
    const {
      orderId,
      token,
      amount,
    } = createKushkiChargeDto;

    const order =
      await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new BadRequestException(
        'Order not found',
      );
    }

    try {
      const response = await axios.post(
        `${process.env.KUSHKI_BASE_URL}/card/v1/charges`,
        {
          token,
          amount: {
            subtotalIva: amount,
            iva: 0,
          },
          currency: 'USD',
        },
        {
          headers: {
            'Content-Type':
              'application/json',
            'Public-Merchant-Id':
              process.env.KUSHKI_PUBLIC_KEY,
            'Private-Merchant-Id':
              process.env.KUSHKI_PRIVATE_KEY,
          },
        },
      );

      const payment =
        await this.prisma.payment.create({
          data: {
            orderId,
            paymentMethod: 'CARD',
            gateway: 'KUSHKI',
            transactionId:
              response.data.ticketNumber,
            amount,
            status: 'SUCCESS',
          },
        });

      await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'PAID',
        },
      });

      return {
        success: true,
        payment,
        kushki: response.data,
      };
    } catch (error) {
      throw new BadRequestException(
        error.response?.data ||
          'Payment failed',
      );
    }
  }
}