import { Country } from 'src/app/core/models/forms-and-components/country.model';

export interface State {
  isOnline: boolean;
  countryList: Country[];
  error?: any;
}

export const initialState: State = {
  isOnline: true,
  countryList: [],
  error: null
};
