import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';

import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException(
        'Cart is empty',
      );
    }

    let totalAmount = 0;

    for (const item of cart.items) {
      totalAmount +=
        item.product.price * item.quantity;
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return order;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        status: updateOrderStatusDto.status,
      },
    });
  }
}