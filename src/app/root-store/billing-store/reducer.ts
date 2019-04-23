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
    case ActionTypes.CREATE_NEW_INVOICE_COMPLETE:
      return {
        ...state,
      };
    case ActionTypes.UPDATE_INVOICE_COMPLETE:
      return {
        ...state,
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
