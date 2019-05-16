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

    default: {
      return state;
    }
  }
}
