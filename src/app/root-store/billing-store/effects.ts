import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { BillingService } from 'src/app/core/services/billing.service';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import * as billingFeatureActions from './actions';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class BillingStoreEffects {
  constructor(
    private actions$: Actions,
    private billingService: BillingService,
  ) { }

  @Effect()
  processPaymentRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.ProcessPaymentRequested>(
      billingFeatureActions.ActionTypes.PROCESS_PAYMENT_REQUESTED
    ),
    switchMap(action =>
      this.billingService.processPayment(action.payload.billingData)
        .pipe(
          map(paymentResponse => new billingFeatureActions.ProcessPaymentComplete({paymentResponse})),
          catchError(error => {
            return of(new billingFeatureActions.LoadErrorDetected({ error }));
          })
        )

    )
  );

}
