import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentsessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripe_secret);

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
          orderId
        }
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${envs.striipe_success_url}`,
      cancel_url: `${envs.striipe_cancel_url}`,
    });
    return session;
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
        //TODO llamar a nuestri microservicio
        console.log({
          metadata: chargeSucceded.metadata,
        });
        break;

      default:
        break;
    }

    return response.status(200).json({ signature });
  }
}
