import {
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreatePaypalOrderDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  amount: number;
}