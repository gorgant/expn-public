import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { Invoice } from '../models/billing/invoice.model';
import { Observable, throwError, pipe, from } from 'rxjs';
import { takeUntil, map, catchError, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { now } from 'moment';
import { PaymentResponseMsg } from '../models/billing/payment-response-msg.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreActions } from 'src/app/root-store';
import { PaymentSvrResponse } from '../models/billing/payment-svr-response.model';
import { AngularFireFunctions } from '@angular/fire/functions';
import { StripeChargeData } from '../models/billing/stripe-charge-data.model';
import * as Stripe from 'stripe';




@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private fns: AngularFireFunctions,
  ) { }

  processPayment(billingData: StripeChargeData): Observable<Stripe.charges.ICharge> {

    const fun = this.fns.httpsCallable('stripeCreateCharge');
    const res: Observable<Stripe.charges.ICharge> = fun(
      {
        source: billingData.source.id,
        uid: billingData.anonymousUID,
        amount: billingData.priceInCents,
      }
    )
      .pipe(
        take(1),
        tap(response => console.log('Payment processed', response)),
        catchError(error => {
          console.log('Error processing payment', error);
          return throwError(error);
        })
      );

    return res;
  }

}
