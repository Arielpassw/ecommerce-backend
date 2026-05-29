import {
  IsString,
  IsUUID,
} from 'class-validator';

export class CapturePaypalOrderDto {
  @IsString()
  paypalOrderId: string;

  @IsUUID()
  orderId: string;
}