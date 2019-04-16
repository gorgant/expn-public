import { State } from './state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';
import { Country } from 'src/app/core/models/forms-and-components/country.model';

const getError = (state: State): any => state.error;
const getIsOnline = (state: State): boolean => state.isOnline;
const getCountryList = (state: State): Country[] => state.countryList;

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

export const selectCountryList: MemoizedSelector<object, Country[]>
= createSelector(
  selectUiState,
  getCountryList
);

export const selectCountryByCode: (countryCode: string) => MemoizedSelector<object, Country>
= (countryCode: string) => createSelector(
  selectCountryList,
  countryList => countryList.filter(country => country.code === countryCode)[0]
);

