import { IsNumber, IsString } from 'class-validator';

export class CreateStripeSessionDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;
}