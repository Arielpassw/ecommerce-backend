import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
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

    if (!cart) {
      await this.prisma.cart.create({
        data: {
          userId,
        },
      });

      cart = await this.prisma.cart.findUnique({
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
    }

    return cart;
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ) {
    const cart = await this.getCart(userId);

    if (!cart) {
      throw new NotFoundException(
        'Cart not found',
      );
    }

    const existingItem =
      await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: addToCartDto.productId,
        },
      });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity:
            existingItem.quantity +
            addToCartDto.quantity,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      },
    });
  }

  async updateCartItem(
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity: updateCartItemDto.quantity,
      },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        'Cart not found',
      );
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      message: 'Cart cleared',
    };
  }
}