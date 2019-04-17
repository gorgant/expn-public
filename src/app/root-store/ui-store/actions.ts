import { Action } from '@ngrx/store';
import { GeographicData } from 'src/app/core/models/forms-and-components/geography/geographic-data.model';


export enum ActionTypes {
  APP_ONLINE = '[Connection] App is Online',
  APP_OFFLINE = '[Connection] App is Offline',
  GEOGRAPHIC_DATA_REQUESTED = '[UI] Geographic Data Requested',
  GEOGRAPHIC_DATA_LOADED = '[UI] Geographic Data Loaded',
  UI_DATA_LOAD_ERROR = '[UI] Load Failure'
}

export class AppOnline implements Action {
  readonly type = ActionTypes.APP_ONLINE;
}

export class AppOffline implements Action {
  readonly type = ActionTypes.APP_OFFLINE;
}

export class GeographicDataRequested implements Action {
  readonly type = ActionTypes.GEOGRAPHIC_DATA_REQUESTED;
}

export class GeographicDataLoaded implements Action {
  readonly type = ActionTypes.GEOGRAPHIC_DATA_LOADED;

  constructor(public payload: { geographicData: GeographicData }) {}
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.UI_DATA_LOAD_ERROR;
  constructor(public payload: { error: string }) {}
}

export type Actions =
  AppOnline |
  AppOffline |
  GeographicDataRequested |
  GeographicDataLoaded |
  LoadErrorDetected
  ;
