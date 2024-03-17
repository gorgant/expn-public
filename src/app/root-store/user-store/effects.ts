import { Injectable, inject } from "@angular/core";
import { FirebaseError } from "@angular/fire/app";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, concatMap, map } from "rxjs/operators";
import * as UserStoreActions from './actions';
import { WebFormService } from "../../core/services/web-form.service";
import { AuthService } from "../../core/services/auth.service";

@Injectable()
export class UserStoreEffects {

  private authService = inject(AuthService);
  private webFormService = inject(WebFormService);
  private actions$ = inject(Actions);

  constructor() { }

  processSubscriptionFormEffect$ = createEffect(() => this.actions$
    .pipe(
      ofType(UserStoreActions.processSubscriptionFormRequested),
      concatMap(action => 
        this.webFormService.processSubscriptionForm(action.subscriberData).pipe(
          map(newPublicUser => {
            return UserStoreActions.processSubscriptionFormCompleted({newPublicUser});
          }),
          catchError(error => {
            const fbError: FirebaseError = {
              code: error.code,
              message: error.message,
              name: error.name
            };
            return of(UserStoreActions.processSubscriptionFormFailed({error: fbError}));
          })
        )
      ),
    ),
  );

  processContactFormEffect$ = createEffect(() => this.actions$
    .pipe(
      ofType(UserStoreActions.processContactFormRequested),
      concatMap(action => 
        this.webFormService.processContactForm(action.contactForm).pipe(
          map(empty => {
            return UserStoreActions.processContactFormCompleted();
          }),
          catchError(error => {
            const fbError: FirebaseError = {
              code: error.code,
              message: error.message,
              name: error.name
            };
            return of(UserStoreActions.processContactFormFailed({error: fbError}));
          })
        )
      ),
    ),
  );

  verifyEmailEffect$ = createEffect(() => this.actions$
    .pipe(
      ofType(UserStoreActions.verifyEmailRequested),
      concatMap(action => 
        this.authService.verifyEmail(action.emailVerificationData).pipe(
          map(emailVerified => {
            return UserStoreActions.verifyEmailCompleted({verifyEmailSucceeded: emailVerified});
          }),
          catchError(error => {
            const fbError: FirebaseError = {
              code: error.code,
              message: error.message,
              name: error.name
            };
            return of(UserStoreActions.verifyEmailFailed({error: fbError}));
          })
        )
      ),
    ),
  );

}