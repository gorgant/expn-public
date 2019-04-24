import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { BillingService } from 'src/app/core/services/billing.service';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import * as billingFeatureActions from './actions';
import { switchMap, map, catchError, tap } from 'rxjs/operators';

@Injectable()
export class BillingStoreEffects {
  constructor(
    private actions$: Actions,
    private billingService: BillingService,
    // private store$: Store<RootStoreState.State>,
  ) { }

  @Effect()
  loadLatestInvoiceRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.LoadLatestInvoiceRequested>(
      billingFeatureActions.ActionTypes.LOAD_LATEST_INVOICE_REQUESTED
    ),
    switchMap(action =>
      this.billingService.fetchLatestInvoice(action.payload.userId)
        .pipe(
          map(invoice => new billingFeatureActions.LoadLatestInvoiceComplete({invoice})),
          catchError(error => {
            return of(new billingFeatureActions.LoadErrorDetected({ error }));
          })
        )
    )
  );

  @Effect()
  createNewInvoiceRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.CreateNewInvoiceRequested>(
      billingFeatureActions.ActionTypes.CREATE_NEW_INVOICE_REQUESTED
    ),
    switchMap(action =>
      this.billingService.createInvoice(action.payload.invoiceNoId)
      .pipe(
        // Load updated invoice into store
        tap(invoice => new billingFeatureActions.LoadLatestInvoiceComplete({invoice})),
        // Then dispatch primary completion action
        map(invoice => new billingFeatureActions.CreateNewInvoiceComplete({invoice})),
        catchError(error => {
          return of(new billingFeatureActions.LoadErrorDetected({ error }));
        })
      )
    )
  );

  // @Effect()
  // updateInvoiceRequestedEffect$: Observable<Action> = this.actions$.pipe(
  //   ofType<billingFeatureActions.UpdateInvoiceRequested>(
  //     billingFeatureActions.ActionTypes.UPDATE_INVOICE_REQUESTED
  //   ),
  //   switchMap(action =>
  //     this.billingService.updateInvoice(action.payload.invoice)
  //     .pipe(
  //       // Load updated invoice into store
  //       tap(invoice => new billingFeatureActions.LoadLatestInvoiceComplete({invoice})),
  //       // Then dispatch primary completion action
  //       map(invoice => new billingFeatureActions.UpdateInvoiceComplete({invoice})),
  //       catchError(error => {
  //         return of(new billingFeatureActions.LoadErrorDetected({ error }));
  //       })
  //     )
  //   )
  // );

  @Effect()
  processPaymentRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.ProcessPaymentRequested>(
      billingFeatureActions.ActionTypes.PROCESS_PAYMENT_REQUESTED
    ),
    switchMap(action =>
      this.billingService.processPayment(action.payload.invoice)
        .pipe(
          map(paymentResponse => new billingFeatureActions.ProcessPaymentComplete({paymentResponse})),
          catchError(error => {
            return of(new billingFeatureActions.LoadErrorDetected({ error }));
          })
        )

    )
  );

}
