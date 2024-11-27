import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentsessionDto } from './dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripe_secret);
  private readonly logger = new Logger('PaymentService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentsessionDto: PaymentsessionDto) {
    const { currency, items, orderId } = paymentsessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      //colocar aqui id de la orden
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${envs.stripe_success_url}`,
      cancel_url: `${envs.stripe_cancel_url}`,
    });
    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }

  async stripeWebhook(request: Request, response: Response) {
    const signature = request.headers['stripe-signature'];
    let event: Stripe.Event;
    const endpointSecret = `${envs.stripe_endpointsecret}`;

    try {
      event = this.stripe.webhooks.constructEvent(
        request['rawBody'],
        signature,
        endpointSecret,
      );
    } catch (error) {
      console.log(`⚠️  Webhook signature verification failed.`, error.message);
      return response.sendStatus(400);
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceded.id,
          orderId: chargeSucceded.metadata.orderId,
          receiptUrl: chargeSucceded.receipt_url,
        };
        this.client.emit('payment.succeded', payload);
        break;

      default:
        console.log(`Event ${event.type} not handled`);
    }

    return response.status(200).json({ signature });
  }
}
