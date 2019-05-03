import * as functions from 'firebase-functions';
import { getOrCreateCustomer } from "./customers";
import { stripe } from "./config";
import { assertUID, assert, catchErrors } from './helpers';


/**
 * Attaches a payment source to a stripe customer account.
 */

export const attachSource = async(uid: string, sourceId: string) => {
  const customer = await getOrCreateCustomer(uid);

  // Check if source already exists on customer
  const existingSource = customer.sources!.data.filter(s => s.id === sourceId).pop();

  if (existingSource) {
    // If existing source, do not create new source or update customer
    return existingSource;
  } else {
    await stripe.customers.createSource(customer.id, { source: sourceId });
    // Optional: update most recent payment method as default method
    return await stripe.customers.update(customer.id, { default_source: sourceId });
  }
}

/////// DEPLOYABLE FUNCTIONS ///////

export const stripeAttachSource = functions.https.onCall( async (data, context) => {
  const uid = assertUID(context);
  const source = assert(data, 'source');

  return catchErrors(attachSource(uid, source));
});