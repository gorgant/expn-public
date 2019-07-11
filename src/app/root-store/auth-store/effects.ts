import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import * as authFeatureActions from './actions';
import * as userFeatureActions from '../user-store/actions';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { RootStoreState } from '..';

@Injectable()
export class AuthStoreEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private store$: Store<RootStoreState.State>,
  ) { }

  @Effect()
  authenticationRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<authFeatureActions.AuthenticationRequested>(
      authFeatureActions.ActionTypes.AUTHENTICATION_REQUESTED
    ),
    switchMap(action => {
      return this.authService.authenticatePublicUser()
        .pipe(
          // Load user data into the store
          tap(userData => {
            if (!userData) {
              throw new Error('User data not found');
            }
            // Add or update user info in database (will trigger a subsequent user store update request in User Store)
            return this.store$.dispatch(new userFeatureActions.StoreUserDataRequested({userData}));
          }),
          map(userData => new authFeatureActions.AuthenticationComplete()),
          catchError(error => {
            return of(new authFeatureActions.LoadErrorDetected({ error }));
          })
        );
    })
  );
}
