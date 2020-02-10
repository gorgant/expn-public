import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.USER_DATA_REQUESTED:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case ActionTypes.USER_DATA_LOADED:
      return {
        ...state,
        user: action.payload.userData,
        isLoading: false,
        error: null,
        userLoaded: true,
      };
    case ActionTypes.STORE_USER_DATA_REQUESTED:
      return {
        ...state,
        isLoading: true,
      };
    case ActionTypes.STORE_USER_DATA_COMPLETE:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.USER_DATA_LOAD_ERROR:
      return {
        ...state,
        isLoading: false,
        contactFormProcessing: false,
        subscribeProcessing: false,
        error: action.payload.error
      };
    case ActionTypes.SET_CART_DATA:
      return {
        ...state,
        cartItem: action.payload.productData
      };
    case ActionTypes.PURGE_CART_DATA:
      return {
        ...state,
        cartItem: null
      };
    case ActionTypes.SUBSCRIBE_USER_REQUESTED:
      return {
        ...state,
        subscribeProcessing: true
      };
    case ActionTypes.SUBSCRIBE_USER_COMPLETE:
      return {
        ...state,
        subscribeProcessing: false,
        subscribeSubmitted: true
      };
    case ActionTypes.TRANSMIT_CONTACT_FORM_REQUESTED:
      return {
        ...state,
        contactFormProcessing: true
      };
    case ActionTypes.TRANSMIT_CONTACT_FORM_COMPLETE:
      return {
        ...state,
        contactFormProcessing: false,
        contactFormSubmitted: true
      };
    case ActionTypes.STORE_NAV_STAMP_COMPLETE:
      return {
        ...state,
      };
    case ActionTypes.SET_USER_SESSION_ID:
      return {
        ...state,
        userSessionId: action.payload.userSessionId
      };
    case ActionTypes.CONFIRM_SUB_OPT_IN_REQUESTED:
      return {
        ...state,
        confirmSubscriberProcessing: true,
        confirmSubscriberError: null,
      };
    case ActionTypes.CONFIRM_SUB_OPT_IN_COMPLETE:
      return {
        ...state,
        confirmSubscriberProcessing: false,
        subMarkedConfirmed: action.payload.subConfirmed,
      };
    case ActionTypes.CONFIRM_SUB_OPT_IN_ERROR_DETECTED:
      return {
        ...state,
        confirmSubscriberError: action.payload.error,
      };

    default: {
      return state;
    }
  }
}
