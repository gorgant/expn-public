import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.AUTHENTICATION_COMPLETE:
      return {
        ...state,
        isAuthenticated: true
      };
    case ActionTypes.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: true,
      };
    case ActionTypes.SET_UNAUTHENTICATED:
      return {
        isAuthenticated: false
      };
    case ActionTypes.AUTH_LOAD_ERROR:
      return {
        ...state,
        error: action.payload.error
      };
    default: {
      return state;
    }
  }
}
