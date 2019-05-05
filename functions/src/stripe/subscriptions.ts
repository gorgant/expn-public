import * as functions from 'firebase-functions';
import { assert, assertUID, catchErrors } from './helpers';
import { stripe } from './config'; 
import { getStripeCustomerId, updateUser, getOrCreateCustomer } from './customers';
import { attachSource } from './sources';
import { AnonymousUser } from '../../../shared-models/user/anonymous-user.model';


/**
Gets a user's subscriptions
*/
export const getSubscriptions = async(uid: string) => {
  const customer = await getStripeCustomerId(uid);
  return stripe.subscriptions.list({ customer });
}

/**
Creates and charges user for a new subscription
*/
export const createSubscription = async(uid:string, source: stripe.Source, plan: string, coupon?: string) => {
 
  const customer = await getOrCreateCustomer(uid);

  await attachSource(uid, source);

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    coupon,
    items: [
      {
        plan,
      },
    ],
  });

  // Add the plan to existing subscriptions
  const updatedUser: Partial<AnonymousUser> = {
    [plan]: true,
    [subscription.id]: 'active',
  }

  await updateUser(uid, updatedUser);

  return subscription;
}

/**
Cancels a subscription and stops all recurring payments
*/
export async function cancelSubscription(uid: string, subId: string): Promise<any> {

    const subscription  = await stripe.subscriptions.del(subId);

    const updatedUser: Partial<AnonymousUser> = {
        [subscription.plan!.id]: false,
        [subscription.id]: 'canceled'
    }

    await updateUser(uid, updatedUser);

    return subscription;
}

/////// DEPLOYABLE FUNCTIONS ////////

export const stripeCreateSubscription = functions.https.onCall( async (data, context) => {
    const uid = assertUID(context);
    const source = assert(data, 'source');
    const plan = assert(data, 'plan');
    return catchErrors( createSubscription(uid, source, plan, data.coupon) );
});

export const stripeCancelSubscription = functions.https.onCall( async (data, context) => {
    const uid = assertUID(context);
    const plan = assert(data, 'plan');
    return catchErrors( cancelSubscription(uid, plan) );
});

export const stripeGetSubscriptions = functions.https.onCall( async (data, context) => {
    const uid = assertUID(context);
    return catchErrors( getSubscriptions(uid) );
});