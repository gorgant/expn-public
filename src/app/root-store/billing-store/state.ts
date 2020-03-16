import { Stripe as StripeDefs } from 'stripe';
import { StripeError } from 'shared-models/billing/stripe-error.model';
import { DiscountCouponChild } from 'shared-models/billing/discount-coupon.model';

export interface State {
  couponValidationProcessing: boolean;
  discountCoupon: DiscountCouponChild;
  paymentProcessing: boolean;
  stripeCharge: StripeDefs.Charge | StripeError;
  error?: any;
}

export const initialState: State = {
  couponValidationProcessing: false,
  discountCoupon: null,
  paymentProcessing: false,
  stripeCharge: null,
  error: null,
};
