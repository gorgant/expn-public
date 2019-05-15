import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { StripeChargeData } from '../models/billing/stripe-charge-data.model';
import * as Stripe from 'stripe';
import { FbFunctionNames } from '../models/routes-and-paths/fb-function-names';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private fns: AngularFireFunctions,
  ) { }

  processPayment(billingData: StripeChargeData): Observable<Stripe.charges.ICharge> {

    const chargeFunction: (data: StripeChargeData) => Observable<Stripe.charges.ICharge> = this.fns.httpsCallable(
      FbFunctionNames.STRIPE_PROCESS_CHARGE
    );
    const res = chargeFunction(billingData)
      .pipe(
        take(1),
        tap(stripeChargeRes => {
          console.log('Payment processed', stripeChargeRes);
        }),
        catchError(error => {
          console.log('Error processing payment', error);
          return throwError(error);
        })
      );

    return res;
  }

  // This is fired if a charge is processed successfully
  transmitOrderToAdmin(stripeCharge: Stripe.charges.ICharge): Observable<any> {
    console.log('Tansmitting order to admin');

    const transmitOrderFunction: (data: Stripe.charges.ICharge) => Observable<any> = this.fns.httpsCallable(
      FbFunctionNames.TRANSMIT_ORDER_TO_ADMIN
    );
    const res = transmitOrderFunction(stripeCharge)
      .pipe(
        take(1),
        tap(response => {
          console.log('Order transmitted to admin', response);
        }),
        catchError(error => {
          console.log('Error transmitting order', error);
          return throwError(error);
        })
      );

    return res;
  }

}
