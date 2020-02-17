import { initialState, State, featureAdapter } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {

    case ActionTypes.SINGLE_POST_REQUESTED: {
      return {
        ...state,
        isLoading: true,
        error: null
      };
    }

    case ActionTypes.SINGLE_POST_LOADED: {
      return featureAdapter.upsertOne(
        action.payload.post, {
          ...state,
          isLoading: false,
          error: null
        }
      );
    }

    case ActionTypes.ALL_POSTS_REQUESTED: {
      return {
        ...state,
        isLoading: true,
        error: null
      };
    }

    case ActionTypes.ALL_POSTS_LOADED: {
      return featureAdapter.addAll(
        action.payload.posts, {
          ...state,
          isLoading: false,
          error: null,
          postsLoaded: true,
        }
      );
    }

    case ActionTypes.FEATURED_POSTS_REQUESTED: {
      return {
        ...state,
        isLoading: true,
        error: null
      };
    }

    case ActionTypes.FEATURED_POSTS_LOADED: {
      return featureAdapter.addMany(
        action.payload.posts, {
          ...state,
          isLoading: false,
          error: null,
          featuredPostsLoaded: true,
        }
      );
    }

    case ActionTypes.BLOG_INDEX_REQUESTED: {
      return {
        ...state,
        isLoading: true,
        error: null
      };
    }

    case ActionTypes.BLOG_INDEX_LOADED: {
      return featureAdapter.addMany(
        action.payload.blogIndex, {
          ...state,
          isLoading: false,
          error: null,
          blogIndexLoaded: true
        }
      );
    }

    case ActionTypes.POST_LOAD_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };
    }

    default: {
      return state;
    }
  }
}

// Exporting a variety of selectors in the form of a object from the entity adapter
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = featureAdapter.getSelectors();
