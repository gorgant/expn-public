import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { Stripe as StripeDefs } from 'stripe';
import { StripeError } from 'shared-models/billing/stripe-error.model';
import { DiscountCouponChild } from 'shared-models/billing/discount-coupon.model';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';

const getIsValidatingCoupon = (state: State): any => state.isValidatingCoupon;
const getIsProcessingPayment = (state: State): any => state.isProcessingPayment;
const getIsTransmittingOrder = (state: State): any => state.isTransmittingOrder;
const getValidateCouponError = (state: State): any => state.validateCouponError;
const getProcessPaymentError = (state: State): any => state.processPaymentError;
const getTransmitOrderError = (state: State): any => state.transmitOrderError;
const getDiscountCoupon = (state: State): DiscountCouponChild => state.discountCoupon;
const getStripeCharge = (state: State): StripeDefs.Charge | StripeError => state.stripeCharge;

const selectBillingState: MemoizedSelector<object, State>
= createFeatureSelector<State>(PublicFeatureNames.BILLING);

export const selectDiscountCoupon: MemoizedSelector<object, DiscountCouponChild> = createSelector(
  selectBillingState,
  getDiscountCoupon
);

export const selectStripeCharge: MemoizedSelector<object, StripeDefs.Charge | StripeError> = createSelector(
  selectBillingState,
  getStripeCharge
);

export const selectIsValidatingCoupon: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getIsValidatingCoupon);

export const selectIsProcessingPayment: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getIsProcessingPayment);

export const selectIsTransmittingOrder: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getIsTransmittingOrder);

export const selectValidateCouponError: MemoizedSelector<object, any>
= createSelector(selectBillingState, getValidateCouponError);

export const selectProcessPaymentError: MemoizedSelector<object, any>
= createSelector(selectBillingState, getProcessPaymentError);

export const selectTransmitOrderError: MemoizedSelector<object, any>
= createSelector(selectBillingState, getTransmitOrderError);

