import { Action } from '@ngrx/store';
import { PublicUser } from 'shared-models/user/public-user.model';
import { Product } from 'shared-models/products/product.model';
import { EmailSubData } from 'shared-models/subscribers/email-sub-data.model';
import { ContactForm } from 'shared-models/user/contact-form.model';
import { NavigationStamp } from 'shared-models/analytics/navigation-stamp.model';


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
  PURGE_CART_DATA = '[User] Cart Data Purged',
  SUBSCRIBE_USER_REQUESTED = '[User] Subscribe User Requested',
  SUBSCRIBE_USER_COMPLETE = '[User] Subscribe User Complete',
  TRANSMIT_CONTACT_FORM_REQUESTED = '[User] Transmit Contact Form Requested',
  TRANSMIT_CONTACT_FORM_COMPLETE = '[User] Transmit Contact Form Complete',
  STORE_NAV_STAMP_REQUESTED = '[User] Store Nav Stamp Requested',
  STORE_NAV_STAMP_COMPLETE = '[User] Store Nav Stamp Complete',
  SET_USER_SESSION_ID = '[User] Create User Session Id'
}

export class UserDataRequested implements Action {
  readonly type = ActionTypes.USER_DATA_REQUESTED;

  constructor(public payload: { userId: string }) {}
}

export class UserDataLoaded implements Action {
  readonly type = ActionTypes.USER_DATA_LOADED;

  constructor(public payload: { userData: PublicUser }) {}
}

export class StoreUserDataRequested implements Action {
  readonly type = ActionTypes.STORE_USER_DATA_REQUESTED;

  constructor(public payload: { userData: PublicUser}) {}
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

export class SubscribeUserRequested implements Action {
  readonly type = ActionTypes.SUBSCRIBE_USER_REQUESTED;
  constructor(public payload: { emailSubData: EmailSubData }) {}
}

export class SubscribeUserComplete implements Action {
  readonly type = ActionTypes.SUBSCRIBE_USER_COMPLETE;
}

export class TransmitContactFormRequested implements Action {
  readonly type = ActionTypes.TRANSMIT_CONTACT_FORM_REQUESTED;
  constructor(public payload: { contactForm: ContactForm }) {}
}

export class TransmitContactFormComplete implements Action {
  readonly type = ActionTypes.TRANSMIT_CONTACT_FORM_COMPLETE;
}

export class StoreNavStampRequested implements Action {
  readonly type = ActionTypes.STORE_NAV_STAMP_REQUESTED;
  constructor(public payload: { user: PublicUser, navStamp: NavigationStamp }) {}
}

export class StoreNavStampComplete implements Action {
  readonly type = ActionTypes.STORE_NAV_STAMP_COMPLETE;
}

export class SetUserSessionId implements Action {
  readonly type = ActionTypes.SET_USER_SESSION_ID;
  constructor(public payload: {userSessionId: string}) {}
}

export type Actions =
UserDataRequested |
UserDataLoaded |
StoreUserDataRequested |
StoreUserDataComplete |
LoadErrorDetected |
SetCartData |
PurgeCartData |
SubscribeUserRequested |
SubscribeUserComplete |
TransmitContactFormRequested |
TransmitContactFormComplete |
StoreNavStampRequested |
StoreNavStampComplete |
SetUserSessionId
;
