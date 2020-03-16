import * as functions from 'firebase-functions';
import { getOrCreateCustomer, updateUser } from "./customers";
import { stripe } from './config';
import { Stripe as StripeDefs} from 'stripe';
import { catchErrors, assertUID, assert } from '../config/global-helpers';
import { BillingDetails } from '../../../shared-models/billing/billing-details.model';
import { PublicUser } from '../../../shared-models/user/public-user.model';

/**
 * Attaches a payment source to a stripe customer account.
 */

export const attachSource = async(uid: string, source: StripeDefs.Source) => {
  const customer = await getOrCreateCustomer(uid);
  const sourceOwner = source.owner as StripeDefs.Source.Owner;

  // Check if source already exists on customer
  const existingSource = customer.sources.data.filter(s => s.id === source.id).pop();

  if (existingSource) {
    // If existing source, do not create new source or update customer
    return existingSource;
  } else {
    // Create source on customer
    await stripe.customers.createSource(customer.id, { source: source.id });
    
    // Use source zip to update FB user (which isn't collected on the FB form)
    const updatedZip: Partial<BillingDetails> = { postalCode: (sourceOwner.address as StripeDefs.Address).postal_code as string};
    const publicUser: Partial<PublicUser> = { billingDetails: updatedZip };
    await updateUser(uid, publicUser);

    // Update additional stripe customer fields based on source data and return that customer
    // Create a custom customer update that extends the standard one to include some other properties
    const completeData: StripeDefs.CustomerUpdateParams = {
      default_source: source.id,
      name: sourceOwner.name as string,
      email: sourceOwner.email as string,
      phone: sourceOwner.phone as string,
      address: sourceOwner.address as StripeDefs.AddressParam,
    }
    return await stripe.customers.update(customer.id, completeData);
  }
}

/////// DEPLOYABLE FUNCTIONS ///////

export const stripeAttachSource = functions.https.onCall( async (data, context) => {
  const uid = assertUID(context);
  const source = assert(data, 'source');

  return catchErrors(attachSource(uid, source));
});