import * as Stripe from 'stripe';
import { StripeError } from 'shared-models/billing/stripe-error.model';

export interface State {
  paymentProcessing: boolean;
  stripeCharge: Stripe.charges.ICharge | StripeError;
  error?: any;
}

export const initialState: State = {
  paymentProcessing: false,
  stripeCharge: null,
  error: null,
};
