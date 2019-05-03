import * as functions from 'firebase-functions';
import { getCustomer, getOrCreateCustomer } from "./customers";
import { stripe } from './config';
import { attachSource } from './sources';
import { assertUID, assert, catchErrors } from './helpers';

/**
 * Gets a user's charge history
 */
export const getUserCharges = async(uid: string, limit?: number) => {
  const customer = await getCustomer(uid);

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
export const createCharge = async(uid: string, source: string, amount: number, idempotency_key?: string) => {
  
  const customer = await getOrCreateCustomer(uid);

  await attachSource(uid, source);

  return stripe.charges.create({
    amount,
    customer: customer.id,
    source,
    currency: 'usd',
  },
  { idempotency_key }
  )
}


/////// DEPLOYABLE FUNCTIONS ///////

export const stripeCreateCharge = functions.https.onCall( async (data, context) => {
  const uid = assertUID(context);
  const source = assert(data, 'source');
  const amount = assert(data, 'amount');

  // Optional
  const idempotency_key = data.itempotency_key;

  return catchErrors( createCharge(uid, source, amount, idempotency_key) );
})

export const stripeGetCharges = functions.https.onCall( async (data, context) => {
  const uid = assertUID(context);
  return catchErrors( getUserCharges(uid) );
});