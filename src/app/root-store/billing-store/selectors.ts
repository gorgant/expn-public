import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import * as Stripe from 'stripe';
import { StripeError } from 'src/app/core/models/billing/stripe-error.model';

const getError = (state: State): any => state.error;
const getPaymentProcessing = (state: State): boolean => state.paymentProcessing;
const getStripeCharge = (state: State): Stripe.charges.ICharge | StripeError => state.stripeCharge;

const selectBillingState: MemoizedSelector<object, State>
= createFeatureSelector<State>('billing');

export const selectStripeCharge: MemoizedSelector<object, Stripe.charges.ICharge | StripeError> = createSelector(
  selectBillingState,
  getStripeCharge
);

export const selectBillingError: MemoizedSelector<object, any> = createSelector(
  selectBillingState,
  getError
);

export const selectPaymentProcessing: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getPaymentProcessing);
