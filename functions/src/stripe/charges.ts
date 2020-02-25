import * as functions from 'firebase-functions';
import { getOrCreateCustomer } from "./customers";
import { stripe } from './config';
import { attachSource } from './sources';
import { catchErrors, assertUID, assert } from '../config/global-helpers';
import { StripeChargeData } from '../../../shared-models/billing/stripe-charge-data.model';
import { StripeError } from '../../../shared-models/billing/stripe-error.model';
import { Product } from '../../../shared-models/products/product.model';
import { Stripe as StripeDefs} from 'stripe';
import { StripeChargeMetadata, StripeCustomerMetadata } from '../../../shared-models/billing/stripe-object-metadata.model';

/**
 * Get a specific charge
 */
export const getSingleCharge = (chargeId: string) => {
  return stripe.charges.retrieve(chargeId, {
    expand: ['customer']
  }).catch(err => {console.log(`Error fetching stripe charge:`, err); return err;});
}

/**
 * Creates a charge for a specific amount
 * 
 * @amount in pennies (e.g. $20 === 2000)
 * @idempotency_key ensures charge will only be executed once
 */
export const createCharge = async(uid: string, source: stripe.Source, amount: number, product: Product): Promise<StripeDefs.Charge> => {
  
  const customer = await getOrCreateCustomer(uid);

  await attachSource(uid, source);

  const chargeData: StripeDefs.ChargeCreateParams = {
    amount,
    customer: customer.id,
    source: source.id,
    currency: 'usd',
    metadata: {
      [StripeChargeMetadata.PRODUCT_ID]: product.id, // Add product id to charge record
      [StripeCustomerMetadata.PUBLIC_USER_ID]: uid // Add public UID to charge record
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

export const stripeProcessCharge = functions.https.onCall( async (data: StripeChargeData, context) => {
  console.log('Create charge request received with this data', data);
  const uid: string = assertUID(context);
  const source: stripe.Source = assert(data, 'source');
  const amount: number = assert(data, 'amountPaid');
  const product: Product = assert(data, 'product');

  // TODO: Confirm charge amount matches price of product in admin database (before discounts are applied)

  const chargeResponse: StripeDefs.Charge = await catchErrors(createCharge(uid, source, amount, product)
    .catch(err => {
      return handleStripeChargeResponse(err);
    }));

  return chargeResponse;
});