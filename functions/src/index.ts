import * as functions from 'firebase-functions';

export const testFunction = functions.https.onCall( async (data, context) => {
  const uid  = context.auth && context.auth.uid; // If this is undefined, user is not logged in
  const message = data.message;

  return `${uid} sent a message of ${message}`
});

export { 
  stripeAttachSource 
} from './stripe/sources';

export { 
  stripeCreateCharge,
  stripeGetCharges 
} from './stripe/charges';

export { 
  stripeCreateSubscription, 
  stripeGetSubscriptions, 
  stripeCancelSubscription 
} from './stripe/subscriptions';

export { 
  invoiceWebhookEndpoint,
  subscriptionWebhookEndpoint
} from './stripe/webhooks';

export {
  stripeGetCoupon
} from './stripe/coupons';