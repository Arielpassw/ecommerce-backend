import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Modules\authModule } from './modules/auth/modules/auth.module';
import { Modules\authController } from './modules/auth/modules/auth.controller';
import { Modules\authService } from './modules/auth/modules/auth.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [Modules\authModule, AuthModule, UsersModule, CategoriesModule, CartModule, OrdersModule],
  controllers: [AppController, Modules\authController],
  providers: [AppService, Modules\authService],
})
export class AppModule {}
