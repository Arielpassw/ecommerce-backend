import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import Stripe from 'stripe';

import { PrismaService } from '../../../database/prisma/prisma.service';

import { CreateStripeSessionDto } from './dto/create-stripe-session.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY!,
      {
        apiVersion: '2024-06-20',
      },
    );
  }

  async createCheckoutSession(
    createStripeCheckoutDto: CreateStripeSessionDto,
  ) {
    const {
      orderId,
      amount,
    } = createStripeCheckoutDto;

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
      const session =
        await this.stripe.checkout.sessions.create(
          {
            payment_method_types: ['card'],
            mode: 'payment',

            line_items: [
              {
                price_data: {
                  currency: 'usd',

                  product_data: {
                    name:
                      'Ecommerce Order Payment',
                  },

                  unit_amount: Math.round(
                    amount * 100,
                  ),
                },

                quantity: 1,
              },
            ],

            metadata: {
              orderId,
            },

            success_url:
              'http://localhost:3000/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}',

            cancel_url:
              'http://localhost:3000/payments/stripe/cancel',
          },
        );

      return {
        success: true,

        message:
          'Stripe checkout session created',

        data: session,
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException(
        error.message ||
          'Stripe checkout failed',
      );
    }
  }

  async handleSuccess(
    sessionId: string,
  ) {
    try {
      const session =
        await this.stripe.checkout.sessions.retrieve(
          sessionId,
        );

      if (
        session.payment_status !==
        'paid'
      ) {
        throw new BadRequestException(
          'Payment not completed',
        );
      }

      const orderId =
        session.metadata?.orderId;

      if (!orderId) {
        throw new BadRequestException(
          'Order ID missing',
        );
      }

      const existingPayment =
        await this.prisma.payment.findFirst({
          where: {
            transactionId: session.id,
          },
        });

      if (existingPayment) {
        return {
          success: true,

          message:
            'Payment already processed',

          data: existingPayment,
        };
      }

      const payment =
        await this.prisma.payment.create({
          data: {
            orderId,

            paymentMethod: 'STRIPE',

            gateway: 'STRIPE',

            transactionId: session.id,

            amount:
              session.amount_total! / 100,

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

        message:
          'Stripe payment completed successfully',

        data: payment,
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException(
        error.message ||
          'Stripe success handling failed',
      );
    }
  }
}
