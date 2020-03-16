import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { Stripe as StripeDefs } from 'stripe';
import { StripeError } from 'shared-models/billing/stripe-error.model';
import { DiscountCouponChild } from 'shared-models/billing/discount-coupon.model';

const getError = (state: State): any => state.error;
const getCouponValidationProcessing = (state: State): boolean => state.couponValidationProcessing;
const getDiscountCoupon = (state: State): DiscountCouponChild => state.discountCoupon;
const getPaymentProcessing = (state: State): boolean => state.paymentProcessing;
const getStripeCharge = (state: State): StripeDefs.Charge | StripeError => state.stripeCharge;

const selectBillingState: MemoizedSelector<object, State>
= createFeatureSelector<State>('billing');

export const selectDiscountCoupon: MemoizedSelector<object, DiscountCouponChild> = createSelector(
  selectBillingState,
  getDiscountCoupon
);

export const selectStripeCharge: MemoizedSelector<object, StripeDefs.Charge | StripeError> = createSelector(
  selectBillingState,
  getStripeCharge
);

export const selectBillingError: MemoizedSelector<object, any> = createSelector(
  selectBillingState,
  getError
);

export const selectCouponValidationProcessing: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getCouponValidationProcessing);

export const selectPaymentProcessing: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getPaymentProcessing);
