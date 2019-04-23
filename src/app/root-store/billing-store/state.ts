import { Invoice } from 'src/app/core/models/billing/invoice.model';

export interface State {
  invoice: Invoice;
  isLoading: boolean;
  invoiceLoaded: boolean;
  error?: any;
}

export const initialState: State = {
  invoice: null,
  isLoading: false,
  invoiceLoaded: false,
  error: null,
};
