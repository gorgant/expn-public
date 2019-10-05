import { initialState, State } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {

    case ActionTypes.APP_ONLINE:
      return {
        ...state,
        isOnline: true
      };

    case ActionTypes.APP_OFFLINE:
      return {
        ...state,
        isOnline: false
      };

    case ActionTypes.GEOGRAPHIC_DATA_LOADED:
      return {
        ...state,
        geographicDataLoaded: true,
        geographicData: action.payload.geographicData
      };

    case ActionTypes.HTML_CACHE_ACTIVATED:
      return {
        ...state,
        htmlCacheActive: true
      };

    case ActionTypes.HTML_CACHE_DEACTIVATED:
      return {
        ...state,
        htmlCacheActive: false
      };

    case ActionTypes.BOT_DETECTED:
      return {
        ...state,
        botDetected: true
      };

    case ActionTypes.UI_DATA_LOAD_ERROR:
      return {
        ...state,
        error: action.payload.error
      };

    default: {
      return state;
    }
  }
}
