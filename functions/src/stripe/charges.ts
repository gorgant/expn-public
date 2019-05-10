import * as functions from 'firebase-functions';
import { getStripeCustomerId, getOrCreateCustomer } from "./customers";
import { stripe } from './config';
import { attachSource } from './sources';
import { assertUID, assert, catchErrors } from './helpers';
import { StripeChargeData } from '../../../shared-models/billing/stripe-charge-data.model';
import { StripeError } from '../../../shared-models/billing/stripe-error.model';
import { Product } from '../../../shared-models/products/product.model';
import * as Stripe from 'stripe';
import { publishOrderToAdminTopic } from '../admin/transmit-order';

/**
 * Get a specific charge
 */
export const getSingleCharge = async(chargeId:string) => {
  return await stripe.charges.retrieve(chargeId, {
    expand: ['customer']
  })
}


/**
 * Gets a user's charge history
 */
export const getUserCharges = async(uid: string, limit?: number) => {
  const customer = await getStripeCustomerId(uid);

  return await stripe.charges.list({
    limit,
    customer
  });
}

/**
 * Creates a charge for a specific amount
 * 
 * @amount in pennies (e.g. $20 === 2000)
 * @idempotency_key ensures charge will only be executed once
 */
export const createCharge = async(uid: string, source: stripe.Source, amount: number, product: Product, idempotency_key?: string): Promise<Stripe.charges.ICharge> => {
  
  const customer = await getOrCreateCustomer(uid);

  await attachSource(uid, source);

  const chargeData: Stripe.charges.IChargeCreationOptions = {
    amount,
    customer: customer.id,
    source: source.id,
    currency: 'usd',
    metadata: {
      productId: product.id // Add product id to charge record
    },
    description: product.name // Shows up on receipt billing line item
  }

  return stripe.charges.create(chargeData);
}

const handleStripeChargeResponse = (err: any) => {
  switch (err.type) {
    case 'StripeCardError':
      // A declined card error
      console.log('StripeCardError', err);
      const stripeError: StripeError = {
        stripeErrorType: err.type,
        message: err.message,
        chargeId: err.raw.charge ? err.raw.charge : null
      }
      return stripeError;
    case 'RateLimitError':
      // Too many requests made to the API too quickly
      console.log('RateLimitError', err);
      return err;
    case 'StripeInvalidRequestError':
      // Invalid parameters were supplied to Stripe's API
      console.log('StripeInvalidRequestError', err);
      return err;
    case 'StripeAPIError':
      // An error occurred internally with Stripe's API
      console.log('StripeAPIError', err);
      return err;
    case 'StripeConnectionError':
      // Some kind of error occurred during the HTTPS communication
      console.log('StripeConnectionError', err);
      return err;
    case 'StripeAuthenticationError':
      // You probably used an incorrect API key
      console.log('StripeAuthenticationError', err);
      return err;
    default:
      // Handle any other types of unexpected errors
      console.log('Unknown charge error', err);
      return err;
  }
}


/////// DEPLOYABLE FUNCTIONS ///////

export const stripeCreateCharge = functions.https.onCall( async (data: StripeChargeData, context) => {
  console.log('Create charge request received with this data', data);
  const uid: string = assertUID(context);
  const source: stripe.Source = assert(data, 'source');
  const amount: number = assert(data, 'amountPaid');
  const product: Product = assert(data, 'product');

  // // Optional -- Prevents multiple charges
  // const idempotency_key = data.itempotency_key;

  // Apply charge to customer
  const chargeResponse: Stripe.charges.ICharge = await createCharge(uid, source, amount, product).catch(err => handleStripeChargeResponse(err));

  // // Send order data to admin
  // await transmitOrder(chargeResponse);

  await publishOrderToAdminTopic(chargeResponse);

  return chargeResponse;

  
})

export const stripeGetCharges = functions.https.onCall( async (data, context) => {
  const uid = assertUID(context);
  return catchErrors( getUserCharges(uid) );
});