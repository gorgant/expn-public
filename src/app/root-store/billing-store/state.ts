import { Stripe as StripeDefs } from 'stripe';
import { StripeError } from 'shared-models/billing/stripe-error.model';
import { DiscountCouponChild } from 'shared-models/billing/discount-coupon.model';

export interface State {
  isValidatingCoupon: boolean;
  isProcessingPayment: boolean;
  isTransmittingOrder: boolean;
  discountCoupon: DiscountCouponChild;
  stripeCharge: StripeDefs.Charge | StripeError;
  validateCouponError: any;
  processPaymentError: any;
  transmitOrderError: any;
}

export const initialState: State = {
  isValidatingCoupon: false,
  isProcessingPayment: false,
  isTransmittingOrder: false,
  discountCoupon: null,
  stripeCharge: null,
  validateCouponError: null,
  processPaymentError: null,
  transmitOrderError: null,
};
