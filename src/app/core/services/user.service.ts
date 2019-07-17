import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { map, takeUntil, catchError, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { now } from 'moment';
import { PublicUser } from 'shared-models/user/public-user.model';
import { NavigationStamp } from 'shared-models/analytics/navigation-stamp.model';
import { EmailSubData } from 'shared-models/subscribers/email-sub-data.model';
import { EmailSubscriber } from 'shared-models/subscribers/email-subscriber.model';
import { PublicFunctionNames } from 'shared-models/routes-and-paths/fb-function-names';
import { ContactForm } from 'shared-models/user/contact-form.model';
import { SubscriptionSource } from 'shared-models/subscribers/subscription-source.model';
import { PublicCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private fns: AngularFireFunctions,
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
        console.log('Error storing data in database', error);
        return error;
      });
    return from(fbResponse);
  }

  storeNavStamp(user: PublicUser, navStamp: NavigationStamp): Observable<string> {
    const navStampDoc = this.getNavStampDoc(user.id, navStamp.id);
    // Use set here because may be generating a new user or updating existing user
    const fbResponse = navStampDoc.set(navStamp, {merge: true})
    .then(res => {
      console.log('Nav stamp stored in database', navStamp);
      return user.id;
    } )
    .catch(error => {
      console.log('Error storing data in database', error);
      return error;
    });
    return from(fbResponse);

  }

  // Add user subscription to admin database
  publishEmailSubToAdminTopic(emailSubData: EmailSubData): Observable<any> {
    console.log('Transmitting subscriber to admin');

    const emailSub = this.convertSubDataToSubscriber(emailSubData);

    const publishSubFunction: (data: Partial<EmailSubscriber>) => Observable<any> = this.fns.httpsCallable(
      PublicFunctionNames.TRANSMIT_EMAIL_SUB_TO_ADMIN
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

  publishContactFormToAdminTopic(contactForm: ContactForm): Observable<any> {
    console.log('Transmitting contact form to admin');

    const publishSubFunction: (data: ContactForm) => Observable<any> = this.fns.httpsCallable(
      PublicFunctionNames.TRANSMIT_CONTACT_FORM_TO_ADMIN
    );

    const res = publishSubFunction(contactForm)
      .pipe(
        take(1),
        tap(response => {
          console.log('Contact form transmitted to admin', response);
        }),
        catchError(error => {
          console.log('Error transmitting contact form', error);
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

    const partialSubscriber: Partial<EmailSubscriber> = {
      id: email, // Set id to the user's email
      publicUserData: user,
      modifiedDate: now(),
      lastSubSource: subSource,
      // Sub source array is handled on the admin depending on if subscriber already exists
      // Created date is handled on the admin depending on if subscriber already exists
    };

    return partialSubscriber;
  }

  // Provides easy access to user doc throughout the app
  getUserDoc(userId: string): AngularFirestoreDocument<PublicUser> {
    return this.getUserColletion().doc<PublicUser>(userId);
  }

  private getUserColletion(): AngularFirestoreCollection<PublicUser> {
    return this.db.collection<PublicUser>(PublicCollectionPaths.PUBLIC_USERS);
  }

  private getNavStampDoc(userId: string, navStampId: string): AngularFirestoreDocument<NavigationStamp> {
    return this.getNavStampCollection(userId).doc(navStampId);
  }

  private getNavStampCollection(userId: string): AngularFirestoreCollection<NavigationStamp> {
    return this.getUserDoc(userId).collection<NavigationStamp>(PublicCollectionPaths.NAVIGATION_STAMPS);
  }


}
