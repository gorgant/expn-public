import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { PublicUser } from 'shared-models/user/public-user.model';
import { Product } from 'shared-models/products/product.model';

const getError = (state: State): any => state.error;
const getUserIsLoading = (state: State): boolean => state.isLoading;
const getUserLoaded = (state: State): boolean => state.userLoaded;
const getUser = (state: State): PublicUser => state.user;
const getCartData = (state: State): Product => state.cartItem;
const getSubscribeProcessing = (state: State): boolean => state.subscribeProcessing;
const getSubscribeSubmitted = (state: State): boolean => state.subscribeSubmitted;
const getContactFormProcessing = (state: State): boolean => state.contactFormProcessing;
const getContactFormSubmitted = (state: State): boolean => state.contactFormSubmitted;
const getUserSessionId = (state: State): string => state.userSessionId;

const selectUserState: MemoizedSelector<object, State>
= createFeatureSelector<State>('user');

export const selectUser: MemoizedSelector<object, PublicUser> = createSelector(
  selectUserState,
  getUser
);

export const selectUserError: MemoizedSelector<object, any> = createSelector(
  selectUserState,
  getError
);

export const selectUserIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getUserIsLoading);

export const selectUserLoaded: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getUserLoaded);

export const selectCartData: MemoizedSelector<object, Product>
= createSelector(selectUserState, getCartData);

export const selectSubscribeProcessing: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getSubscribeProcessing);

export const selectSubscribeSubmitted: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getSubscribeSubmitted);

export const selectContactFormProcessing: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getContactFormProcessing);

export const selectContactFormSubmitted: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getContactFormSubmitted);

export const selectUserSessionid: MemoizedSelector<object, string>
= createSelector(selectUserState, getUserSessionId);
