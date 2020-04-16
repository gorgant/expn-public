import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.USER_DATA_REQUESTED:
      return {
        ...state,
        isLoading: true,
        loadError: null,
      };
    case ActionTypes.USER_DATA_LOADED:
      return {
        ...state,
        user: action.payload.userData,
        isLoading: false,
        loadError: null,
      };
    case ActionTypes.STORE_USER_DATA_REQUESTED:
      return {
        ...state,
        isSaving: true,
        saveError: null,
      };
    case ActionTypes.STORE_USER_DATA_COMPLETE:
      return {
        ...state,
        isSaving: false,
        saveError: null,
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
        isSubscribingUser: true,
        subscribeUserError: null,
      };
    case ActionTypes.SUBSCRIBE_USER_COMPLETE:
      return {
        ...state,
        isSubscribingUser: false,
        subscribeUserError: null,
      };
    case ActionTypes.TRANSMIT_CONTACT_FORM_REQUESTED:
      return {
        ...state,
        isTransmittingContactForm: true,
        transmitContactFormError: null,

      };
    case ActionTypes.TRANSMIT_CONTACT_FORM_COMPLETE:
      return {
        ...state,
        isTransmittingContactForm: false,
        transmitContactFormError: null,
      };
    case ActionTypes.STORE_NAV_STAMP_REQUESTED:
      return {
        ...state,
        isStoringNavStamp: true,
        storeNavStampError: null,
      };
    case ActionTypes.STORE_NAV_STAMP_COMPLETE:
      return {
        ...state,
        isStoringNavStamp: false,
        storeNavStampError: null
      };
    case ActionTypes.SET_USER_SESSION_ID:
      return {
        ...state,
        userSessionId: action.payload.userSessionId
      };
    case ActionTypes.CONFIRM_SUB_OPT_IN_REQUESTED:
      return {
        ...state,
        isConfirmingSubOptIn: true,
        confirmSubOptInError: null
      };
    case ActionTypes.CONFIRM_SUB_OPT_IN_COMPLETE:
      return {
        ...state,
        isConfirmingSubOptIn: false,
        confirmSubOptInError: null
      };

    case ActionTypes.LOAD_FAILED: {
      return {
        ...state,
        user: null,
        isLoading: false,
        loadError: action.payload.error
      };
    }

    case ActionTypes.SAVE_FAILED: {
      return {
        ...state,
        isSaving: false,
        saveError: action.payload.error
      };
    }

    case ActionTypes.SUBSCRIBE_USER_FAILED: {
      return {
        ...state,
        isSubscribingUser: false,
        subscribeUserError: action.payload.error
      };
    }

    case ActionTypes.TRANSMIT_CONTACT_FORM_FAILED: {
      return {
        ...state,
        isTransmittingContactForm: false,
        transmitContactFormError: action.payload.error
      };
    }

    case ActionTypes.STORE_NAV_STAMP_FAILED: {
      return {
        ...state,
        isStoringNavStamp: false,
        storeNavStampError: action.payload.error
      };
    }

    case ActionTypes.CONFIRM_SUB_OPT_IN_FAILED: {
      return {
        ...state,
        isConfirmingSubOptIn: false,
        confirmSubOptInError: action.payload.error
      };
    }

    default: {
      return state;
    }
  }
}
