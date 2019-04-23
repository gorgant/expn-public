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
      return this.authService.authenticateAnonymousUser()
        .pipe(
          // Load user data into the store
          tap(userData => {

            // Add or update user info in database (will trigger a subsequent user store update request in User Store)
            return this.store$.dispatch(new userFeatureActions.StoreUserDataRequested({userData}));

            // const userData: AnonymousUser = {
            //   id: userCreds.user.uid,
            //   lastAuthenticated: now()
            // };
            // const isNewUser = userCreds.additionalUserInfo.isNewUser;
            // switch (isNewUser) {
            //   case true:
            //     // This is a new user, so add new user to database
            //     this.store$.dispatch(new userFeatureActions.StoreUserDataRequested({userData}));
            //     // Now return the completed user data action (instead of fetching identical doc from database)
            //     return this.store$.dispatch(new userFeatureActions.UserDataLoaded({userData}));
            //   case false:
            //     // User exists so fetch user data from the database directly
            //     return this.store$.dispatch(new userFeatureActions.UserDataRequested({userId: userData.id}));
            //   default:
            //     return this.store$.dispatch(new userFeatureActions.UserDataRequested({userId: userData.id}));
            // }
          }),
          map(userCreds => new authFeatureActions.AuthenticationComplete()),
          catchError(error => {
            return of(new authFeatureActions.LoadErrorDetected({ error }));
          })
        );
    })
  );
}
