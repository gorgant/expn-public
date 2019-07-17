import { GeographicData } from 'shared-models/forms-and-components/geography/geographic-data.model';

export interface State {
  isOnline: boolean;
  geographicDataLoaded: boolean;
  geographicData: GeographicData;
  error?: any;
}

export const initialState: State = {
  isOnline: true,
  geographicDataLoaded: false,
  geographicData: null,
  error: null
};
