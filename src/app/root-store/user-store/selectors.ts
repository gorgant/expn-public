import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { PublicUser } from 'shared-models/user/public-user.model';
import { Product } from 'shared-models/products/product.model';
import { PublicFeatureNames } from 'shared-models/ngrx-store/feature-names';


const getIsLoading = (state: State): boolean => state.isLoading;
const getIsSaving = (state: State): boolean => state.isSaving;
const getIsSubscribingUser = (state: State): boolean => state.isSubscribingUser;
const getIsTransmittingContactForm = (state: State): boolean => state.isTransmittingContactForm;
const getIsStoringNavStamp = (state: State): boolean => state.isStoringNavStamp;
const getIsConfirmingSubOptIn = (state: State): boolean => state.isConfirmingSubOptIn;

const getLoadError = (state: State): any => state.loadError;
const getSaveError = (state: State): boolean => state.saveError;
const getSubscribeUserError = (state: State): boolean => state.subscribeUserError;
const getTransmitContactFormError = (state: State): boolean => state.transmitContactFormError;
const getStoreNavStampError = (state: State): boolean => state.storeNavStampError;
const getConfirmSubOptInError = (state: State): boolean => state.confirmSubOptInError;


const getUser = (state: State): PublicUser => state.user;
const getCartData = (state: State): Product => state.cartItem;
const getUserSessionId = (state: State): string => state.userSessionId;


const selectUserState: MemoizedSelector<object, State> = createFeatureSelector<State>(PublicFeatureNames.USER);

export const selectIsLoading: MemoizedSelector<object, boolean> = createSelector(selectUserState, getIsLoading);
export const selectIsSaving: MemoizedSelector<object, boolean> = createSelector(selectUserState, getIsSaving);
export const selectIsSubscribingUser: MemoizedSelector<object, boolean> = createSelector(selectUserState, getIsSubscribingUser);
// tslint:disable-next-line:max-line-length
export const selectIsTransmittingContactForm: MemoizedSelector<object, boolean> = createSelector(selectUserState, getIsTransmittingContactForm);
export const selectIsStoringNavStamp: MemoizedSelector<object, boolean> = createSelector(selectUserState, getIsStoringNavStamp);
export const selectIsConfirmingSubOptIn: MemoizedSelector<object, boolean> = createSelector(selectUserState, getIsConfirmingSubOptIn);

export const selectLoadError: MemoizedSelector<object, any> = createSelector(selectUserState, getLoadError);
export const selectSaveError: MemoizedSelector<object, any> = createSelector(selectUserState, getSaveError);
export const selectSubscribeUserError: MemoizedSelector<object, any> = createSelector(selectUserState, getSubscribeUserError);
export const selectTransmitContactFormError: MemoizedSelector<object, any> = createSelector(selectUserState, getTransmitContactFormError);
export const selectStoreNavStampError: MemoizedSelector<object, any> = createSelector(selectUserState, getStoreNavStampError);
export const selectConfirmSubOptInError: MemoizedSelector<object, any> = createSelector(selectUserState, getConfirmSubOptInError);

export const selectUser: MemoizedSelector<object, PublicUser> = createSelector(selectUserState, getUser);
export const selectCartData: MemoizedSelector<object, Product> = createSelector(selectUserState, getCartData);
export const selectUserSessionid: MemoizedSelector<object, string> = createSelector(selectUserState, getUserSessionId);
