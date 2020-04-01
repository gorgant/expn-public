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
  processCouponValidationEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.ValidateCouponRequested>(
      billingFeatureActions.ActionTypes.VALIDATE_COUPON_REQUESTED
    ),
    switchMap(action =>
      this.billingService.validateCoupon(action.payload.validationData)
        .pipe(
          map(discountCoupon => {
            if (!discountCoupon) {
              throw new Error('Error processing discount coupon');
            }
            return new billingFeatureActions.ValidateCouponComplete({discountCoupon});
          }),
          catchError(error => {
            return of(new billingFeatureActions.ValidateCouponError({ error }));
          })
        )

    )
  );

  @Effect()
  processPaymentRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.ProcessPaymentRequested>(
      billingFeatureActions.ActionTypes.PROCESS_PAYMENT_REQUESTED
    ),
    switchMap(action =>
      this.billingService.processPayment(action.payload.billingData)
        .pipe(
          map(paymentResponse => {
            if (!paymentResponse) {
              throw new Error('Payment response not found');
            }
            return new billingFeatureActions.ProcessPaymentComplete({paymentResponse});
          }),
          catchError(error => {
            return of(new billingFeatureActions.ProcessPaymentError({ error }));
          })
        )

    )
  );

  @Effect()
  transmitOrderToAdminEffect$: Observable<Action> = this.actions$.pipe(
    ofType<billingFeatureActions.TransmitOrderToAdminRequested>(
      billingFeatureActions.ActionTypes.TRANSMIT_ORDER_TO_ADMIN_REQUESTED
    ),
    switchMap(action =>
      this.billingService.transmitOrderToAdmin(action.payload.stripeCharge, action.payload.user)
        .pipe(
          map(paymentResponse => {
            if (!paymentResponse) {
              throw new Error('Payment response not found');
            }
            return new billingFeatureActions.TransmitOrderToAdminComplete();
          }),
          catchError(error => {
            return of(new billingFeatureActions.TransmitOrderError({ error }));
          })
        )
    )
  );

}
