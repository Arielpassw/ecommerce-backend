import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(
      req.user.userId,
    );
  }

  @Post('add')
  addToCart(
    @Req() req,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(
      req.user.userId,
      addToCartDto,
    );
  }

  @Patch('item/:id')
  updateCartItem(
    @Param('id') id: string,
    @Body()
    updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      id,
      updateCartItemDto,
    );
  }

  @Delete('item/:id')
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Delete('clear')
  clearCart(@Req() req) {
    return this.cartService.clearCart(
      req.user.userId,
    );
  }
}