import * as Stripe from 'stripe';

export interface State {
  paymentProcessing: boolean;
  stripeCharge: Stripe.charges.ICharge;
  error?: any;
}

export const initialState: State = {
  paymentProcessing: false,
  stripeCharge: null,
  error: null,
};
