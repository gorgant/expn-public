import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { Stripe as StripeDefs } from 'stripe';
import { StripeError } from 'shared-models/billing/stripe-error.model';

const getError = (state: State): any => state.error;
const getPaymentProcessing = (state: State): boolean => state.paymentProcessing;
const getStripeCharge = (state: State): StripeDefs.Charge | StripeError => state.stripeCharge;

const selectBillingState: MemoizedSelector<object, State>
= createFeatureSelector<State>('billing');

export const selectStripeCharge: MemoizedSelector<object, StripeDefs.Charge | StripeError> = createSelector(
  selectBillingState,
  getStripeCharge
);

export const selectBillingError: MemoizedSelector<object, any> = createSelector(
  selectBillingState,
  getError
);

export const selectPaymentProcessing: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getPaymentProcessing);
