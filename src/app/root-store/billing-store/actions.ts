import { Action } from '@ngrx/store';
import { Invoice } from 'src/app/core/models/billing/invoice.model';

export enum ActionTypes {
  LOAD_INVOICE_REQUESTED = '[Billing] Load Invoice Requested',
  LOAD_INVOICE_COMPLETE = '[Billing] Load Invoice Complete',
  CREATE_NEW_INVOICE_REQUESTED = '[Billing] Create New Invoice Requested',
  CREATE_NEW_INVOICE_COMPLETE = '[Billing] Create New Invoice Complete',
  UPDATE_INVOICE_REQUESTED = '[Billing] Update Invoice Requested',
  UPDATE_INVOICE_COMPLETE = '[Billing] Update Invoice Complete',
  PROCESS_PAYMENT_REQUESTED = '[Billing] Process Payment Requested',
  PROCESS_PAYMENT_COMPLETE = '[Billing] Process Payment Complete'
}

export class LoadInvoiceRequested implements Action {
  readonly type = ActionTypes.LOAD_INVOICE_REQUESTED;

  constructor(public payload: { anonymousUID: string, invoiceId: string }) {}
}

export class LoadInvoiceComplete implements Action {
  readonly type = ActionTypes.LOAD_INVOICE_COMPLETE;

  constructor(public payload: { invoice: Invoice }) {}
}

export class CreateNewInvoiceRequested implements Action {
  readonly type = ActionTypes.CREATE_NEW_INVOICE_REQUESTED;

  constructor(public payload: { invoiceNoId: Invoice }) {}
}

export class CreateNewInvoiceComplete implements Action {
  readonly type = ActionTypes.CREATE_NEW_INVOICE_COMPLETE;

  constructor(public payload: { invoice: Invoice }) {}
}

export class UpdateInvoiceRequested implements Action {
  readonly type = ActionTypes.UPDATE_INVOICE_REQUESTED;

  constructor(public payload: { invoice: Invoice }) {}
}

export class UpdateInvoiceComplete implements Action {
  readonly type = ActionTypes.UPDATE_INVOICE_COMPLETE;
}
