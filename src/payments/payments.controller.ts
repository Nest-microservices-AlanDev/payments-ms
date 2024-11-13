import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsessionDto } from './dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Post('create-payment-session')
  createPaymentSession(@Body() paymentsessionDto: PaymentsessionDto) {
    return this.paymentsService.createPaymentSession(paymentsessionDto);
  }

  @Get('success')
  succes() {
    return {
      ok: true,
      message: 'payment successful',
    };
  }

  @Get('cancelled')
  cancell() {
    return {
      ok: false,
      message: 'payment cancelled',
    };
  }

  @Post('webhook')
  async stripeWebhook(@Req() request: Request, @Res() response: Response) {
    return this.paymentsService.stripeWebhook(request, response);
  }
}
