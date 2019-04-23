import { State } from './state';
import { Invoice } from 'src/app/core/models/billing/invoice.model';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';

const getError = (state: State): any => state.error;
const getInvoiceIsLoading = (state: State): boolean => state.isLoading;
const getInvoiceLoaded = (state: State): boolean => state.invoiceLoaded;
const getInvoice = (state: State): Invoice => state.invoice;

const selectBillingState: MemoizedSelector<object, State>
= createFeatureSelector<State>('billing');

export const selectInvoice: MemoizedSelector<object, Invoice> = createSelector(
  selectBillingState,
  getInvoice
);

export const selectBillingError: MemoizedSelector<object, any> = createSelector(
  selectBillingState,
  getError
);

export const selectInvoiceIsLoading: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getInvoiceIsLoading);

export const selectInvoiceLoaded: MemoizedSelector<object, boolean>
= createSelector(selectBillingState, getInvoiceLoaded);
