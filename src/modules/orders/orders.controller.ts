import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { Role } from '@prisma/client';

import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post('checkout')
  checkout(@Req() req) {
    return this.ordersService.checkout(
      req.user.userId,
    );
  }

  @Get('my-orders')
  getMyOrders(@Req() req) {
    return this.ordersService.getMyOrders(
      req.user.userId,
    );
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body()
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto,
    );
  }
}