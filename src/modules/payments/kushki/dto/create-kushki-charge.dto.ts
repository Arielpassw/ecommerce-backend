import {
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateKushkiChargeDto {
  @IsString()
  orderId: string;

  @IsString()
  token: string;

  @IsNumber()
  amount: number;
}