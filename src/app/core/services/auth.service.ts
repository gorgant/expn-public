import { Injectable, inject } from '@angular/core';
import { EmailVerificationData } from '../../../../shared-models/email/email-verification-data';
import { Observable, catchError, delay, map, mergeMap, of, take, throwError, timer } from 'rxjs';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { PublicFunctionNames } from '../../../../shared-models/routes-and-paths/fb-function-names.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private functions = inject(Functions);

  constructor() { }

  verifyEmail(emailVerificationData: EmailVerificationData): Observable<boolean> {

    console.log('Submitting email to server for verification');

    // return of(true).pipe(
    //   delay(5000)
    // );

    // return timer(5000).pipe(
    //   mergeMap(() => throwError(() => new Error('Error after 5 seconds')))
    // );

    const verifyEmailHttpCall: (data: EmailVerificationData) => Observable<boolean> = httpsCallableData(
      this.functions,
      PublicFunctionNames.ON_CALL_VERIFY_EMAIL
    );
    const res = verifyEmailHttpCall(emailVerificationData)
      .pipe(
        take(1),
        map(emailVerified => {
          console.log('Email verification outcome:', emailVerified);
          if (!emailVerified) {
            throw new Error(`Error confirming subscriber: ${emailVerified}`);
          }
          return emailVerified;
        }),
        catchError(error => {
          console.log('Error confirming subscriber', error);
          return throwError(() => new Error(error));
        })
      );

    return res;
  }

}
