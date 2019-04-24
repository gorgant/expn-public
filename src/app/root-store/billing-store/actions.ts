import { Action } from '@ngrx/store';
import { Invoice } from 'src/app/core/models/billing/invoice.model';
import { PaymentResponseMsg } from 'src/app/core/models/billing/payment-response-msg.model';
import { PaymentSvrResponse } from 'src/app/core/models/billing/payment-svr-response.model';

export enum ActionTypes {
  LOAD_LATEST_INVOICE_REQUESTED = '[Billing] Load Latest Invoice Requested',
  LOAD_LATEST_INVOICE_COMPLETE = '[Billing] Load Latest Invoice Complete',
  CREATE_NEW_INVOICE_REQUESTED = '[Billing] Create New Invoice Requested',
  CREATE_NEW_INVOICE_COMPLETE = '[Billing] Create New Invoice Complete',
  // UPDATE_INVOICE_REQUESTED = '[Billing] Update Invoice Requested',
  // UPDATE_INVOICE_COMPLETE = '[Billing] Update Invoice Complete',
  PROCESS_PAYMENT_REQUESTED = '[Billing] Process Payment Requested',
  PROCESS_PAYMENT_COMPLETE = '[Billing] Process Payment Complete',
  PURGE_BILLING_STATE = '[Billing] Invoice State Purged',
  LOAD_ERROR_DETECTED = '[Billing] Billing Load Error',
}

export class LoadLatestInvoiceRequested implements Action {
  readonly type = ActionTypes.LOAD_LATEST_INVOICE_REQUESTED;

  constructor(public payload: { userId: string }) {}
}

export class LoadLatestInvoiceComplete implements Action {
  readonly type = ActionTypes.LOAD_LATEST_INVOICE_COMPLETE;

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

// export class UpdateInvoiceRequested implements Action {
//   readonly type = ActionTypes.UPDATE_INVOICE_REQUESTED;

//   constructor(public payload: { invoice: Invoice }) {}
// }

// export class UpdateInvoiceComplete implements Action {
//   readonly type = ActionTypes.UPDATE_INVOICE_COMPLETE;

//   constructor(public payload: { invoice: Invoice }) {}
// }

export class ProcessPaymentRequested implements Action {
  readonly type = ActionTypes.PROCESS_PAYMENT_REQUESTED;

  constructor(public payload: { invoice: Invoice }) {}
}

export class ProcessPaymentComplete implements Action {
  readonly type = ActionTypes.PROCESS_PAYMENT_COMPLETE;

  constructor(public payload: { paymentResponse: PaymentSvrResponse }) {}
}

export class PurgeBillingState implements Action {
  readonly type = ActionTypes.PURGE_BILLING_STATE;
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.LOAD_ERROR_DETECTED;
  constructor(public payload: { error: string }) {}
}

export type Actions =
LoadLatestInvoiceRequested |
LoadLatestInvoiceComplete |
CreateNewInvoiceRequested |
CreateNewInvoiceComplete |
// UpdateInvoiceRequested |
// UpdateInvoiceComplete |
ProcessPaymentRequested |
ProcessPaymentComplete |
PurgeBillingState |
LoadErrorDetected
;
