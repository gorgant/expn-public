import { stripe } from './config';
import * as Stripe from 'stripe';
import * as functions from 'firebase-functions';
import { updateUser } from './customers';
import { AnonymousUser } from '../../../shared-models/user/anonymous-user.model';

export const invoiceWebhookSignature = functions.config().stripe.invoice_webhook_signature;
export const subscriptionWebhookSignature = functions.config().stripe.subscription_webhook_signature;

export const invoiceWebhookHandler = async (invoice: Stripe.invoices.IInvoice) => {
  const customerId = invoice.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const uid = customer.metadata.firebaseUID;
  console.log('Retrieved customer data', customer);
  
  const subId = invoice.subscription as string; 
  const subscription = await stripe.subscriptions.retrieve(subId);
  console.log('Retrieved subscription data', subscription);

  // Establish whether or not the subscription is active
  const isActive = subscription.status === 'active';
  
  const dayInMils = 86400000;
  const nextPaymentDueDate = subscription.current_period_end + dayInMils;

  const updatedUser: Partial<AnonymousUser> = {
    [subscription.plan!.id]: isActive,
    [subscription.id]: subscription.status,
    nextPaymentDue: nextPaymentDueDate
  }

  return await updateUser(uid, updatedUser);
};

// Receives an invoice payload from stripe
export const invoiceWebhookEndpoint = functions.https.onRequest(
  async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string | string[];
      // This validates the signature from the header using the strip SDK
      const event = stripe.webhooks.constructEvent(
        req.rawBody, // Firebase converts the req to JSON, so extract raw body
        sig,
        invoiceWebhookSignature
      );
      const data = event.data.object as Stripe.invoices.IInvoice;
      console.log('Sending webhook data to handler', data);

      await invoiceWebhookHandler(data);

      res.sendStatus(200);
    } catch (err) {
      res.status(400).send(err);
    }
  }
);

export const subscriptionWebhookHandler = async (subscription: Stripe.subscriptions.ISubscription) => {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  console.log('Retrieved customer data', customerId);
  const uid = customer.metadata.firebaseUID;

  let subscriptionTerminationDate;
  if (subscription.cancel_at_period_end) {
    subscriptionTerminationDate = subscription.current_period_end;
  }

  // Clear next payment due and add termination date
  const updatedUser = {
    [subscription.id]: subscription.status,
    nextPaymentDue: null as any,
    subscriptionTerminationDate
  }

  // Mark plan false if subscription canceled
  const isCanceled = subscription.status === 'canceled';
  if (isCanceled) {
    updatedUser[subscription.plan!.id] = false;
  }

  return await updateUser(uid, updatedUser);
};

// Receives a subscription payload from stripe
export const subscriptionWebhookEndpoint = functions.https.onRequest(
  async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string | string[];;
      // This validates the signature from the header using the strip SDK
      const event = stripe.webhooks.constructEvent(
        req.rawBody, // Firebase converts the req to JSON, so extract raw body
        sig,
        subscriptionWebhookSignature
      );
      const data = event.data.object as Stripe.subscriptions.ISubscription;
      console.log('Sending webhook data to handler', data);

      await subscriptionWebhookHandler(data);

      res.sendStatus(200);
    } catch (err) {
      res.status(400).send(err);
    }
  }
);