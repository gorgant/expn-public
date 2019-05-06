import { Action } from '@ngrx/store';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { Product } from 'src/app/core/models/products/product.model';

export enum ActionTypes {
  USER_DATA_REQUESTED = '[User] User Data Requested',
  USER_DATA_LOADED = '[User] User Data Loaded',
  STORE_USER_DATA_REQUESTED = '[User] Store User Data Requested',
  STORE_USER_DATA_COMPLETE = '[User] User Data Stored',
  UPDATE_PASSWORD_REQUESTED = '[User] Update Password Requested',
  UPDATE_PASSWORD_COMPLETE = '[User] Password Updated',
  UPDATE_PROFILE_IMAGE_REQUESTED = '[User] Update Profile Image Requested',
  UPDATE_PROFILE_IMAGE_COMPLETE = '[User] Update Profile Image Complete',
  USER_DATA_LOAD_ERROR = '[User] Load Failure',
  SET_CART_DATA = '[User] Cart Data Set',
  PURGE_CART_DATA = '[User] Cart Data Purged'
}

export class UserDataRequested implements Action {
  readonly type = ActionTypes.USER_DATA_REQUESTED;

  constructor(public payload: { userId: string }) {}
}

export class UserDataLoaded implements Action {
  readonly type = ActionTypes.USER_DATA_LOADED;

  constructor(public payload: { userData: AnonymousUser }) {}
}

export class StoreUserDataRequested implements Action {
  readonly type = ActionTypes.STORE_USER_DATA_REQUESTED;

  constructor(public payload: { userData: AnonymousUser}) {}
}

export class StoreUserDataComplete implements Action {
  readonly type = ActionTypes.STORE_USER_DATA_COMPLETE;
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.USER_DATA_LOAD_ERROR;
  constructor(public payload: { error: string }) {}
}

export class SetCartData implements Action {
  readonly type = ActionTypes.SET_CART_DATA;
  constructor(public payload: {productData: Product}) {}
}

export class PurgeCartData implements Action {
  readonly type = ActionTypes.PURGE_CART_DATA;
}

export type Actions =
UserDataRequested |
UserDataLoaded |
StoreUserDataRequested |
StoreUserDataComplete |
LoadErrorDetected |
SetCartData |
PurgeCartData
;
