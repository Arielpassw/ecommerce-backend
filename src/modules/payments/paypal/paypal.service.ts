import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import axios from 'axios';

import { PrismaService } from '../../../database/prisma/prisma.service';

import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

@Injectable()
export class PaypalService {
  constructor(private prisma: PrismaService) {}

  async generateAccessToken() {
    try {
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
      ).toString('base64');

      const response = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type':
              'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.log(
        JSON.stringify(error.response?.data, null, 2),
      );

      throw new BadRequestException(
        'Failed generating PayPal token',
      );
    }
  }

  async createOrder(
    createPaypalOrderDto: CreatePaypalOrderDto,
  ) {
    const { orderId, amount } = createPaypalOrderDto;

    const backendUrl =
      process.env.BACKEND_URL ||
      'http://localhost:3000';

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const accessToken = await this.generateAccessToken();

    try {
      const response = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',

          purchase_units: [
            {
              reference_id: orderId,
              amount: {
                currency_code: 'USD',
                value: '5.00',
                // Para producción:
                // value: amount.toFixed(2),
              },
            },
          ],

          application_context: {
            brand_name: 'APP MOVIL',
            landing_page: 'LOGIN',
            user_action: 'PAY_NOW',
            return_url:
               `${backendUrl}/payments/paypal/success?orderId=${orderId}`,
            cancel_url:
             `${backendUrl}/payments/paypal/cancel?orderId=${orderId}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const approveLink = response.data.links.find(
        (link) => link.rel === 'approve',
      );

      return {
        success: true,
        paypalOrderId: response.data.id,
        status: response.data.status,
        approveLink: approveLink?.href,
      };
    } catch (error) {
      console.log(
        JSON.stringify(error.response?.data, null, 2),
      );

      throw new BadRequestException(
        error.response?.data ||
          'PayPal order creation failed',
      );
    }
  }

  async captureOrder(
    capturePaypalOrderDto: CapturePaypalOrderDto,
  ) {
    const { paypalOrderId, orderId } =
      capturePaypalOrderDto;

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const accessToken = await this.generateAccessToken();

    try {
      const orderResponse = await axios.get(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log(
        'PAYPAL ORDER STATUS:',
        orderResponse.data.status,
      );

      if (orderResponse.data.status !== 'APPROVED') {
        throw new BadRequestException(
          `PayPal order is not approved. Current status: ${orderResponse.data.status}`,
        );
      }

      const response = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(
        JSON.stringify(response.data, null, 2),
      );

      const capture =
        response.data.purchase_units[0].payments.captures[0];

      await this.prisma.payment.create({
        data: {
          orderId,
          paymentMethod: 'PAYPAL',
          gateway: 'PAYPAL',
          transactionId: capture.id,
          amount: Number(capture.amount.value),
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
        message: 'Payment captured successfully',
        data: response.data,
      };
    } catch (error) {
      console.log(
        JSON.stringify(error.response?.data, null, 2),
      );

      throw new BadRequestException(
        error.response?.data ||
          error.message ||
          'PayPal capture failed',
      );
    }
  }
}