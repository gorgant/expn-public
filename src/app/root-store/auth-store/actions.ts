import { Action } from '@ngrx/store';

export enum ActionTypes {
  AUTHENTICATION_REQUESTED = '[Auth] Authentication Requested',
  AUTHENTICATION_COMPLETE = '[Auth] Authentication Complete',
  SET_AUTHENTICATED = '[Auth] Set Authenticated',
  SET_UNAUTHENTICATED = '[Auth] Set Unauthenticated',
  AUTH_LOAD_ERROR = '[Auth] Load Failure'
}

export class AuthenticationRequested implements Action {
  readonly type = ActionTypes.AUTHENTICATION_REQUESTED;
}

export class AuthenticationComplete implements Action {
  readonly type = ActionTypes.AUTHENTICATION_COMPLETE;
}

export class SetAuthenticated implements Action {
  readonly type = ActionTypes.SET_AUTHENTICATED;
}

export class SetUnauthenticated implements Action {
  readonly type = ActionTypes.SET_UNAUTHENTICATED;
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.AUTH_LOAD_ERROR;
  constructor(public payload: { error: string }) {}
}

export type Actions =
  AuthenticationRequested |
  AuthenticationComplete |
  SetAuthenticated |
  SetUnauthenticated |
  LoadErrorDetected
  ;
