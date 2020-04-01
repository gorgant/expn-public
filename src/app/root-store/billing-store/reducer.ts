import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.VALIDATE_COUPON_REQUESTED:
      return {
        ...state,
        isValidatingCoupon: true,
        validateCouponError: null
      };
    case ActionTypes.VALIDATE_COUPON_COMPLETE:
      return {
        ...state,
        isValidatingCoupon: false,
        discountCoupon: action.payload.discountCoupon,
        validateCouponError: null
      };
    case ActionTypes.PROCESS_PAYMENT_REQUESTED:
      return {
        ...state,
        isProcessingPayment: true,
        processPaymentError: null
      };
    case ActionTypes.PROCESS_PAYMENT_COMPLETE:
      return {
        ...state,
        isProcessingPayment: false,
        stripeCharge: action.payload.paymentResponse,
        processPaymentError: null
      };
    case ActionTypes.TRANSMIT_ORDER_TO_ADMIN_REQUESTED:
      return {
        ...state,
        isTransmittingOrder: true,
        transmitOrderError: null
      };
    case ActionTypes.TRANSMIT_ORDER_TO_ADMIN_COMPLETE:
      return {
        ...state,
        isTransmittingOrder: false,
        transmitOrderError: null
      };
    case ActionTypes.PURGE_STRIPE_CHARGE:
      return {
        ...state,
        stripeCharge: null,
        processPaymentError: null,
      };
    case ActionTypes.PURGE_BILLING_STATE:
      return {
        isValidatingCoupon: false,
        isProcessingPayment: false,
        isTransmittingOrder: false,
        discountCoupon: null,
        stripeCharge: null,
        validateCouponError: null,
        processPaymentError: null,
        transmitOrderError: null,
      };
    case ActionTypes.VALIDATE_COUPON_ERROR:
      return {
        ...state,
        isValidatingCoupon: false,
        validateCouponError: action.payload.error
      };
    case ActionTypes.PROCESS_PAYMENT_ERROR:
      return {
        ...state,
        isProcessingPayment: false,
        processPaymentError: action.payload.error
      };

    default: {
      return state;
    }
  }
}
