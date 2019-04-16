import { Action } from '@ngrx/store';
import { Country } from 'src/app/core/models/forms-and-components/country.model';


export enum ActionTypes {
  APP_ONLINE = '[Connection] App is Online',
  APP_OFFLINE = '[Connection] App is Offline',
  COUNTRY_LIST_REQUESTED = '[UI] Country List Requested',
  COUNTRY_LIST_LOADED = '[UI] Country List Set',
  UI_DATA_LOAD_ERROR = '[UI] Load Failure'
}

export class AppOnline implements Action {
  readonly type = ActionTypes.APP_ONLINE;
}

export class AppOffline implements Action {
  readonly type = ActionTypes.APP_OFFLINE;
}

export class CountryListRequested implements Action {
  readonly type = ActionTypes.COUNTRY_LIST_REQUESTED;
}

export class CountryListLoaded implements Action {
  readonly type = ActionTypes.COUNTRY_LIST_LOADED;

  constructor(public payload: { countryList: Country[] }) {}
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.UI_DATA_LOAD_ERROR;
  constructor(public payload: { error: string }) {}
}

export type Actions =
  AppOnline |
  AppOffline |
  CountryListRequested |
  CountryListLoaded |
  LoadErrorDetected
  ;
