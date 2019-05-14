import * as functions from 'firebase-functions';
import { Order } from '../../../shared-models/orders/order.model';
import { now } from 'moment';
import * as Stripe from 'stripe';
import { getSingleCharge } from '../stripe/charges';
import { PubSub } from '@google-cloud/pubsub';
import { assert } from '../stripe/helpers';
const pubSub = new PubSub();

const publishOrderToAdminTopic = async (order: Partial<Order>) => {

  console.log('Commencing order trasmission based on this data', order);
  
  // Target topic in the admin PubSub (must add this project's service account to target project)
  // Courtesy of https://stackoverflow.com/a/55003466/6572208
  const topic = pubSub.topic('projects/explearning-admin/topics/save-order');

  const topicPublishRes = await topic.publishJSON(order)
    .catch(err => {
      console.log('Publish to topic failed', err);
      return err;
    });
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}

/////// DEPLOYABLE FUNCTIONS ///////

export const transmitOrderToAdmin = functions.https.onCall( async (data: Stripe.charges.ICharge, context ) => {
  console.log('Transmit order request received with this data', data);

  // Get charge with expanded customer data
  const charge = await getSingleCharge(data.id);

  // Ensure all key data is present
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

  const transmitSubResponse = await publishOrderToAdminTopic(order)
    .catch(error => {
      console.log('Error transmitting subscriber', error);
      return error;
    })
  
  return transmitSubResponse;
})