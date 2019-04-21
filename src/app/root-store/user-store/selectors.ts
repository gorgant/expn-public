import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { AppUser } from 'src/app/core/models/user/app-user.model';
import { Product } from 'src/app/core/models/products/product.model';

const getError = (state: State): any => state.error;
const getUserIsLoading = (state: State): boolean => state.isLoading;
const getProfileImageIsLoading = (state: State): boolean => state.profileImageLoading;
const getUserLoaded = (state: State): boolean => state.userLoaded;
const getUser = (state: State): AppUser => state.user;
const getProductData = (state: State): Product => state.productData;

export const selectUserState: MemoizedSelector<object, State>
= createFeatureSelector<State>('user');

export const selectAppUser: MemoizedSelector<object, AppUser> = createSelector(
  selectUserState,
  getUser
);

export const selectUserIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getUserIsLoading);

export const selectProfileImageIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getProfileImageIsLoading);

export const selectUserLoaded: MemoizedSelector<object, boolean>
= createSelector(selectUserState, getUserLoaded);

export const selectProductData: MemoizedSelector<object, Product>
= createSelector(selectUserState, getProductData);
