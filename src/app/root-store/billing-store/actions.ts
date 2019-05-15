import { Action } from '@ngrx/store';
import { StripeChargeData } from 'src/app/core/models/billing/stripe-charge-data.model';
import * as Stripe from 'stripe';

export enum ActionTypes {
  PROCESS_PAYMENT_REQUESTED = '[Billing] Process Payment Requested',
  PROCESS_PAYMENT_COMPLETE = '[Billing] Process Payment Complete',
  TRANSMIT_ORDER_TO_ADMIN_REQUESTED = '[Billing] Transmit Order to Admin Requested',
  TRANSMIT_ORDER_TO_ADMIN_COMPLETE = '[Billing] Transmit Order to Admin Complete',
  PURGE_STRIPE_CHARGE = '[Billing] Stripe Charge Purged',
  PURGE_BILLING_STATE = '[Billing] Invoice State Purged',
  LOAD_ERROR_DETECTED = '[Billing] Billing Load Error',
}

export class ProcessPaymentRequested implements Action {
  readonly type = ActionTypes.PROCESS_PAYMENT_REQUESTED;

  constructor(public payload: { billingData: StripeChargeData }) {}
}

export class ProcessPaymentComplete implements Action {
  readonly type = ActionTypes.PROCESS_PAYMENT_COMPLETE;

  constructor(public payload: { paymentResponse: Stripe.charges.ICharge }) {}
}

export class TransmitOrderToAdminRequested implements Action {
  readonly type = ActionTypes.TRANSMIT_ORDER_TO_ADMIN_REQUESTED;

  constructor(public payload: { stripeCharge: Stripe.charges.ICharge}) {}
}

export class TransmitOrderToAdminComplete implements Action {
  readonly type = ActionTypes.TRANSMIT_ORDER_TO_ADMIN_COMPLETE;
}

export class PurgeStripeCharge implements Action {
  readonly type = ActionTypes.PURGE_STRIPE_CHARGE;
}

export class PurgeBillingState implements Action {
  readonly type = ActionTypes.PURGE_BILLING_STATE;
}

export class LoadErrorDetected implements Action {
  readonly type = ActionTypes.LOAD_ERROR_DETECTED;
  constructor(public payload: { error: string }) {}
}

export type Actions =
ProcessPaymentRequested |
ProcessPaymentComplete |
TransmitOrderToAdminRequested |
TransmitOrderToAdminComplete |
PurgeStripeCharge |
PurgeBillingState |
LoadErrorDetected
;
