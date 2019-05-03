import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.PROCESS_PAYMENT_REQUESTED:
      return {
        ...state,
        paymentProcessing: true
      };
    case ActionTypes.PROCESS_PAYMENT_COMPLETE:
      return {
        ...state,
        paymentProcessing: false,
        stripeCharge: action.payload.paymentResponse,
      };
    case ActionTypes.PURGE_BILLING_STATE:
      return {
        paymentProcessing: null,
        stripeCharge: null,
        error: null,
      };
    case ActionTypes.LOAD_ERROR_DETECTED:
      return {
        ...state,
        error: action.payload.error
      };

    default: {
      return state;
    }
  }
}
