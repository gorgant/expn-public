import { initialState, State, featureAdapter } from './state';
import { Actions, ActionTypes } from './actions';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {

    case ActionTypes.SINGLE_POST_REQUESTED: {
      return {
        ...state,
        isLoading: true,
        loadError: null
      };
    }

    case ActionTypes.SINGLE_POST_LOADED: {
      return featureAdapter.upsertOne(
        action.payload.post, {
          ...state,
          isLoading: false,
          loadError: null
        }
      );
    }

    case ActionTypes.ALL_POSTS_REQUESTED: {
      return {
        ...state,
        isLoading: true,
        loadError: null
      };
    }

    case ActionTypes.ALL_POSTS_LOADED: {
      return featureAdapter.addAll(
        action.payload.posts, {
          ...state,
          isLoading: false,
          loadError: null,
          postsLoaded: true
        }
      );
    }

    case ActionTypes.FEATURED_POSTS_REQUESTED: {
      return {
        ...state,
        isLoadingFeaturedPosts: true,
        featuredPostLoadError: null
      };
    }

    case ActionTypes.FEATURED_POSTS_LOADED: {
      return featureAdapter.addMany(
        action.payload.posts, {
          ...state,
          isLoadingFeaturedPosts: false,
          featuredPostLoadError: null,
        }
      );
    }

    case ActionTypes.BLOG_INDEX_REQUESTED: {
      return {
        ...state,
        isLoadingBlogIndex: true,
        blogIndexLoadError: null
      };
    }

    case ActionTypes.BLOG_INDEX_LOADED: {
      return featureAdapter.addMany(
        action.payload.blogIndex, {
          ...state,
          isLoadingBlogIndex: false,
          blogIndexLoadError: null,
          blogIndexLoaded: true
        }
      );
    }

    case ActionTypes.LOAD_FAILED: {
      return {
        ...state,
        isLoading: false,
        loadError: action.payload.error
      };
    }

    case ActionTypes.FEATURED_POSTS_LOAD_FAILED: {
      return {
        ...state,
        isLoadingFeaturedPosts: false,
        featuredPostLoadError: action.payload.error
      };
    }

    case ActionTypes.BLOG_INDEX_LOAD_FAILED: {
      return {
        ...state,
        isLoadingBlogIndex: false,
        blogIndexLoadError: action.payload.error,
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
