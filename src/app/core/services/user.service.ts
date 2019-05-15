import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { PublicUser } from '../models/user/public-user.model';
import { map, takeUntil, catchError, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { FbCollectionPaths } from '../models/routes-and-paths/fb-collection-paths';
import { SubscriptionSource } from '../models/subscribers/subscription-source.model';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FbFunctionNames } from '../models/routes-and-paths/fb-function-names';
import { EmailSubData } from '../models/subscribers/email-sub-data.model';
import { BillingService } from './billing.service';
import { EmailSubscriber } from '../models/subscribers/email-subscriber.model';
import { now } from 'moment';
import { Order } from '../models/orders/order.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private fns: AngularFireFunctions,
    private billingService: BillingService
  ) { }

  fetchUserData(userId: string): Observable<PublicUser> {
    const userDoc = this.getUserDoc(userId);
    return userDoc
      .valueChanges()
      .pipe(
        // If logged out, this triggers unsub of this observable
        takeUntil(this.authService.unsubTrigger$),
        map(user => {
          console.log('Fetched user', user);
          return user;
        }),
        catchError(error => {
          console.log('Error fetching user', error);
          return throwError(error);
        })
      );
  }

  storeUserData(user: PublicUser): Observable<string> {
    const userDoc = this.getUserDoc(user.id);
    // Use set here because may be generating a new user or updating existing user
    const fbResponse = userDoc.set(user, {merge: true})
      .then(res => {
        console.log('User data stored in database');
        return user.id;
      } )
      .catch(error => {
        console.log('Error storing data in database');
        return throwError(error).toPromise();
      });
    return from(fbResponse);
  }

  // Add user subscription to admin database
  publishEmailSubToAdminTopic(emailSubData: EmailSubData): Observable<any> {
    console.log('Tansmitting subscriber to admin');

    const emailSub = this.convertSubDataToSubscriber(emailSubData);

    const publishSubFunction: (data: Partial<EmailSubscriber>) => Observable<any> = this.fns.httpsCallable(
      FbFunctionNames.TRANSMIT_EMAIL_SUB_TO_ADMIN
    );
    const res = publishSubFunction(emailSub)
      .pipe(
        take(1),
        tap(response => {
          console.log('Subscriber transmitted to admin', response);
        }),
        catchError(error => {
          console.log('Error transmitting subscriber', error);
          return throwError(error);
        })
      );

    return res;
  }

  private convertSubDataToSubscriber(subData: EmailSubData): Partial<EmailSubscriber> {
    // Ensure all key data is present
    const user: PublicUser = subData.user;
    const subSource: SubscriptionSource = subData.subSource;
    const email: string = user.billingDetails.email;
    // If sub came from a purchase, add that order to the sub data
    const lastOrder: Order = subData.stripeCharge ? this.billingService.convertStripeChargeToOrder(subData.stripeCharge) : null;

    const partialSubscriber: Partial<EmailSubscriber> = {
      id: email, // Set id to the user's email
      publicUserData: user,
      active: true,
      modifiedDate: now(),
      lastSubSource: subSource,
      lastOrder
      // Sub source array is handled on the admin depending on if subscriber already exists
      // Order history is handled on the admin depending on if subscriber already exists
      // Created date is handled on the admin depending on if subscriber already exists
    };

    return partialSubscriber;
  }

  // Provides easy access to user doc throughout the app
  getUserDoc(userId: string): AngularFirestoreDocument<PublicUser> {
    return this.getUserColletion().doc<PublicUser>(userId);
  }

  private getUserColletion(): AngularFirestoreCollection<PublicUser> {
    return this.db.collection<PublicUser>(FbCollectionPaths.PUBLIC_USERS);
  }


}
