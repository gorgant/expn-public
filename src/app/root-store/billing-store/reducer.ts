import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_LATEST_INVOICE_REQUESTED:
      return {
        ...state,
        isLoading: true
      };
    case ActionTypes.LOAD_LATEST_INVOICE_COMPLETE:
      return {
        ...state,
        isLoading: false,
        invoiceLoaded: true,
        invoice: action.payload.invoice
      };
    case ActionTypes.CREATE_NEW_INVOICE_REQUESTED:
      return {
        ...state,
        isLoading: true
      };
    case ActionTypes.CREATE_NEW_INVOICE_COMPLETE:
      return {
        ...state,
        isLoading: false,
        invoiceLoaded: true,
        invoice: action.payload.invoice,
      };
    // case ActionTypes.UPDATE_INVOICE_COMPLETE:
    //   return {
    //     ...state,
    //     invoice: action.payload.invoice
    //   };
    case ActionTypes.PROCESS_PAYMENT_REQUESTED:
      return {
        ...state,
        paymentProcessing: true
      };
    case ActionTypes.PROCESS_PAYMENT_COMPLETE:
      return {
        ...state,
        paymentProcessing: false,
        paymentResponseMsg: action.payload.paymentResponse.responseMsg,
        invoice: action.payload.paymentResponse.invoice,
      };
    case ActionTypes.PURGE_BILLING_STATE:
      return {
        error: null,
        isLoading: null,
        invoiceLoaded: null,
        paymentProcessing: null,
        paymentResponseMsg: null,
        invoice: null
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
