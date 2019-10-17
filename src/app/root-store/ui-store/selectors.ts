import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { GeographicData } from 'shared-models/forms-and-components/geography/geographic-data.model';
import { Country } from 'shared-models/forms-and-components/geography/country.model';
import { UsState } from 'shared-models/forms-and-components/geography/us-state.model';

const getError = (state: State): any => state.error;
const getIsOnline = (state: State): boolean => state.isOnline;
const getGeographicDataLoaded = (state: State): boolean => state.geographicDataLoaded;
const getGeographicData = (state: State): GeographicData => state.geographicData;
const getHTMLCacheActive = (state: State): boolean => state.htmlCacheActive;
const getBotDetected = (state: State): boolean => state.botDetected;
const getAngularUniversalDetected = (state: State): boolean => state.angularUniversalDetected;

export const selectUiState: MemoizedSelector<object, State>
= createFeatureSelector<State>('ui');

export const selectIsOnline: MemoizedSelector<object, boolean>
= createSelector(
  selectUiState,
  getIsOnline
);

export const selectUiError: MemoizedSelector<object, any> = createSelector(
  selectUiState,
  getError
);

export const selectGeographicDataLoaded: MemoizedSelector<object, boolean>
= createSelector(
  selectUiState,
  getGeographicDataLoaded
);

export const selectGeographicData: MemoizedSelector<object, GeographicData>
= createSelector(
  selectUiState,
  getGeographicData
);

export const selectCountryByCode: (countryCode: string) => MemoizedSelector<object, Country>
= (countryCode: string) => createSelector(
  selectGeographicData,
  geographicData => geographicData.countryList.filter(country => country.code === countryCode)[0]
);

export const selectUsStateByAbbr: (stateAbbr: string) => MemoizedSelector<object, UsState>
= (stateAbbr: string) => createSelector(
  selectGeographicData,
  geographicData => geographicData.usStateList.filter(state => state.abbr === stateAbbr)[0]
);

export const selectHTMLCacheActive: MemoizedSelector<object, boolean>
= createSelector(
  selectUiState,
  getHTMLCacheActive
);

export const selectBotDetected: MemoizedSelector<object, boolean>
= createSelector(
  selectUiState,
  getBotDetected
);

export const selectAngularUniversalDetected: MemoizedSelector<object, boolean>
= createSelector(
  selectUiState,
  getAngularUniversalDetected
);

