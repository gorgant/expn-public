import {
  createReducer,
  on
} from '@ngrx/store';
import * as  UserStoreActions from './actions';
import { initialUserState } from './state';


export const userStoreReducer = createReducer(
  initialUserState,

  // Purge User State

  on(UserStoreActions.purgeUserState, (state, action) => {
    return {
      ...state,
      processSubscriptionFormError: null,
      processSubscriptionFormProcessing: false,
      processContactFormError: null,
      processContactFormProcessing: false,
      verifyEmailError: null,
      verifyEmailProcessing: false,
      verifyEmailSucceeded: false,
      publicUserData: null,
    }
  }),

  // Purge User State Errors

  on(UserStoreActions.purgeUserStateErrors, (state, action) => {
    return {
      ...state,
      processSubscriptionFormError: null,
      processContactFormError: null,
      verifyEmailError: null,
    }
  }),

  // Process Subscription Form

  on(UserStoreActions.processSubscriptionFormRequested, (state, action) => {
    return {
      ...state,
      processSubscriptionFormProcessing: true,
      processSubscriptionFormError: null
    }
  }),
  on(UserStoreActions.processSubscriptionFormCompleted, (state, action) => {
    return {
      ...state,
      processSubscriptionFormProcessing: false,
      publicUserData: action.newPublicUser,
      userSubmittedForm: true
    }
  }),
  on(UserStoreActions.processSubscriptionFormFailed, (state, action) => {
    return {
      ...state,
      processSubscriptionFormProcessing: false,
      processSubscriptionFormError: action.error
    }
  }),

  // Process Contact Form

  on(UserStoreActions.processContactFormRequested, (state, action) => {
    return {
      ...state,
      processContactFormProcessing: true,
      processContactFormError: null
    }
  }),
  on(UserStoreActions.processContactFormCompleted, (state, action) => {
    return {
      ...state,
      processContactFormProcessing: false,
      userSubmittedForm: true
    }
  }),
  on(UserStoreActions.processContactFormFailed, (state, action) => {
    return {
      ...state,
      processContactFormProcessing: false,
      processContactFormError: action.error
    }
  }),

  // Verify Email

  on(UserStoreActions.verifyEmailRequested, (state, action) => {
    return {
      ...state,
      verifyEmailProcessing: true,
      verifyEmailError: null,
      verifyEmailSucceeded: false,
    }
  }),
  on(UserStoreActions.verifyEmailCompleted, (state, action) => {
    return {
      ...state,
      verifyEmailProcessing: false,
      verifyEmailError: null,
      verifyEmailSucceeded: action.verifyEmailSucceeded,
    }
  }),
  on(UserStoreActions.verifyEmailFailed, (state, action) => {
    return {
      ...state,
      verifyEmailProcessing: false,
      verifyEmailError: action.error,
      verifyEmailSucceeded: false,
    }
  }),
  
);