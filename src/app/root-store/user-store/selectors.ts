import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { Product } from 'src/app/core/models/products/product.model';

const getError = (state: State): any => state.error;
const getUserIsLoading = (state: State): boolean => state.isLoading;
const getUserLoaded = (state: State): boolean => state.userLoaded;
const getUser = (state: State): AnonymousUser => state.user;
const getCartData = (state: State): Product => state.cartItem;

const selectUserState: MemoizedSelector<object, State>
= createFeatureSelector<State>('user');

export const selectAppUser: MemoizedSelector<object, AnonymousUser> = createSelector(
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
