import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { AppUser } from 'src/app/core/models/user/app-user.model';
import { Product } from 'src/app/core/models/products/product.model';

const getError = (state: State): any => state.error;
const getUserIsLoading = (state: State): boolean => state.isLoading;
const getProfileImageIsLoading = (state: State): boolean => state.profileImageLoading;
const getUserLoaded = (state: State): boolean => state.userLoaded;
const getUser = (state: State): AppUser => state.user;
const getCartData = (state: State): Product => state.cartItem;

export const selectUserState: MemoizedSelector<object, State>
= createFeatureSelector<State>('user');

export const selectAppUser: MemoizedSelector<object, AppUser> = createSelector(
  selectUserState,
  getUser
);

export const selectUserError: MemoizedSelector<object, any> = createSelector(
  selectUserState,
  getError
);

export const selectUserIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getUserIsLoading);

export const selectProfileImageIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getProfileImageIsLoading);

export const selectUserLoaded: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getUserLoaded);

export const selectCartData: MemoizedSelector<object, Product>
= createSelector(selectUserState, getCartData);
