import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UserState } from "./state";
import { PublicStoreFeatureKeys } from "../../../../shared-models/store/feature-keys.model";

const getProcessSubscriptionFormError = (state: UserState) => state.processSubscriptionFormError;
const getProcessSubscriptionFormProcessing = (state: UserState) => state.processSubscriptionFormProcessing;
const getProcessContactFormError = (state: UserState) => state.processContactFormError;
const getProcessContactFormProcessing = (state: UserState) => state.processContactFormProcessing;
const getUserSubmittedForm = (state: UserState) => state.userSubmittedForm;
const getVerifyEmailError = (state: UserState) => state.verifyEmailError;
const getVerifyEmailProcessing = (state: UserState) => state.verifyEmailProcessing;
const getVerifyEmailSucceeded = (state: UserState) => state.verifyEmailSucceeded;


const getPublicUserData = (state: UserState) => state.publicUserData;

const selectUserState = createFeatureSelector<UserState>(PublicStoreFeatureKeys.USER);


export const selectProcessSubscriptionFormError = createSelector(
  selectUserState,
  getProcessSubscriptionFormError
);

export const selectProcessSubscriptionFormProcessing = createSelector(
  selectUserState,
  getProcessSubscriptionFormProcessing
);

export const selectProcessContactFormError = createSelector(
  selectUserState,
  getProcessContactFormError
);

export const selectProcessContactFormProcessing = createSelector(
  selectUserState,
  getProcessContactFormProcessing
);

export const selectUserSubmittedForm = createSelector(
  selectUserState,
  getUserSubmittedForm
);

export const selectVerifyEmailError = createSelector(
  selectUserState,
  getVerifyEmailError
);

export const selectVerifyEmailProcessing = createSelector(
  selectUserState,
  getVerifyEmailProcessing
);

export const selectVerifyEmailSucceeded = createSelector(
  selectUserState,
  getVerifyEmailSucceeded
);

export const selectPublicUserData = createSelector(
  selectUserState,
  getPublicUserData
);
