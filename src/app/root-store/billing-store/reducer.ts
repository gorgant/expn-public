import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.VALIDATE_COUPON_REQUESTED:
      return {
        ...state,
        couponValidationProcessing: true,
        error: null
      };
    case ActionTypes.VALIDATE_COUPON_COMPLETE:
      return {
        ...state,
        couponValidationProcessing: false,
        discountCoupon: action.payload.discountCoupon
      };
    case ActionTypes.PROCESS_PAYMENT_REQUESTED:
      return {
        ...state,
        paymentProcessing: true,
        error: null
      };
    case ActionTypes.PROCESS_PAYMENT_COMPLETE:
      return {
        ...state,
        paymentProcessing: false,
        stripeCharge: action.payload.paymentResponse,
      };
    case ActionTypes.TRANSMIT_ORDER_TO_ADMIN_COMPLETE:
      return {
        ...state
      };
    case ActionTypes.PURGE_STRIPE_CHARGE:
      return {
        ...state,
        stripeCharge: null,
      };
    case ActionTypes.PURGE_BILLING_STATE:
      return {
        couponValidationProcessing: null,
        discountCoupon: null,
        paymentProcessing: null,
        stripeCharge: null,
        error: null,
      };
    case ActionTypes.LOAD_ERROR_DETECTED:
      return {
        ...state,
        error: action.payload.error,
        paymentProcessing: false
      };

    default: {
      return state;
    }
  }
}
