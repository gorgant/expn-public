import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { AnonymousUser } from '../models/user/anonymous-user.model';
import { map, takeUntil, catchError, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { FbCollectionPaths } from '../models/routes-and-paths/fb-collection-paths';
import { SubscriptionSource } from '../models/subscribers/subscription-source.model';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FbFunctionNames } from '../models/routes-and-paths/fb-function-names';
import { EmailSubData } from '../models/subscribers/email-sub-data.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private fns: AngularFireFunctions,
  ) { }

  fetchUserData(userId: string): Observable<AnonymousUser> {
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

  storeUserData(user: AnonymousUser): Observable<string> {
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

    const publishSubFunction: (emailSubData: EmailSubData) => Observable<any> = this.fns.httpsCallable(
      FbFunctionNames.TRANSMIT_EMAIL_SUB_TO_ADMIN
    );
    const res = publishSubFunction(emailSubData)
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

  // Provides easy access to user doc throughout the app
  getUserDoc(userId: string): AngularFirestoreDocument<AnonymousUser> {
    return this.getUserColletion().doc<AnonymousUser>(userId);
  }

  private getUserColletion(): AngularFirestoreCollection<AnonymousUser> {
    return this.db.collection<AnonymousUser>(FbCollectionPaths.ANONYMOUS_USERS);
  }


}
