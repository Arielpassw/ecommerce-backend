import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { KushkiService } from './kushki.service';

import { CreateKushkiChargeDto } from './dto/create-kushki-charge.dto';

@Controller('payments/kushki')
@UseGuards(JwtAuthGuard)
export class KushkiController {
  constructor(
    private readonly kushkiService: KushkiService,
  ) {}

  @Post('charge')
  createCharge(
    @Body()
    createKushkiChargeDto: CreateKushkiChargeDto,
  ) {
    return this.kushkiService.createCharge(
      createKushkiChargeDto,
    );
  }
}