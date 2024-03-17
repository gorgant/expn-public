import {
  createReducer,
  on
} from '@ngrx/store';
import * as  PostStoreActions from './actions';
import { featureAdapter, initialPostState } from './state';

export const postStoreReducer = createReducer(
  initialPostState,

  // Fetch Post Boilerplate

  on(PostStoreActions.fetchPostBoilerplateRequested, (state, action) => {
    return {
      ...state,
      fetchPostBoilerplateProcessing: true,
      fetchPostBoilerplateError: null,
      postBoilerplateData: null,
    }
  }),
  on(PostStoreActions.fetchPostBoilerplateCompleted, (state, action) => {
    return {
      ...state,
      fetchPostBoilerplateProcessing: false,
      fetchPostBoilerplateError: null,
      postBoilerplateData: action.postBoilerplateData,
    }
  }),
  on(PostStoreActions.fetchPostBoilerplateFailed, (state, action) => {
    return {
      ...state,
      fetchPostBoilerplateProcessing: false,
      fetchPostBoilerplateError: action.error,
      postBoilerplateData: null,
    }
  }),

  // Fetch Single Post

  on(PostStoreActions.fetchSinglePostRequested, (state, action) => {
    return {
      ...state,
      fetchSinglePostProcessing: true,
      fetchSinglePostError: null
    }
  }),
  on(PostStoreActions.fetchSinglePostCompleted, (state, action) => {
    return featureAdapter.upsertOne(
      action.post, {
        ...state,
        fetchSinglePostProcessing: false,  
      }
    );
  }),
  on(PostStoreActions.fetchSinglePostFailed, (state, action) => {
    return {
      ...state,
      fetchSinglePostProcessing: false,
      fetchSinglePostError: action.error
    }
  }),

  // Purge Post State

  on(PostStoreActions.purgePostState, (state, action) => {
    return featureAdapter.removeAll(
      {
        ...state,
        fetchPostBoilerplateError: null,
        fetchPostBoilerplateProcessing: false,
        fetchSinglePostError: null,
        fetchSinglePostProcessing: false,

        postBoilerplateData: null,
      }
    );
  }),

  // Purge Post State Errors

  on(PostStoreActions.purgePostStateErrors, (state, action) => {
    return {
      ...state,
      fetchPostBoilerplateError: null,
      fetchSinglePostError: null,
    }
  }),


);

// Exporting a variety of selectors in the form of a object from the entity adapter
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = featureAdapter.getSelectors();