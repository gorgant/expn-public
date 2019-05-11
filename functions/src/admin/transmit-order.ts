import { Order } from '../../../shared-models/orders/order.model';
import { now } from 'moment';
import * as Stripe from 'stripe';
import { getSingleCharge } from '../stripe/charges';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
const pubSub = new PubSub();

/////// DEPLOYABLE FUNCTIONS ///////

export const publishOrderToAdminTopic = async (chargeData: Stripe.charges.ICharge) => {

  console.log('Commencing order trasmission based on this data', chargeData);
  
  // Get charge with expanded customer data
  const charge = await getSingleCharge(chargeData.id);

  const stripeChargeId: string = assert(charge, 'id');
  const stripeCustomerId: string = assert(charge.customer, 'id');
  const name: string = assert(charge.customer, 'name');
  const email: string = assert(charge.customer, 'email');
  const anonymousUID: string = assert((charge.customer as Stripe.customers.ICustomer).metadata, 'firebaseUID');
  const productId: string = assert(charge.metadata, 'productId');
  const amountPaid: number = assert(charge, 'amount');

  const order: Partial<Order> = {
    processedDate: now(),
    stripeChargeId,
    stripeCustomerId,
    name,
    email,
    anonymousUID,
    productId,
    amountPaid,
    status: 'inactive',
  }

  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic('projects/explearning-admin/topics/save-order');

  const topicPublishRes = await topic.publishJSON(order).catch(err => console.log('Publish to topic failed', err));
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}