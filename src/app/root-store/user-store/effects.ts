import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import * as userFeatureActions from './actions';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { RootStoreState } from '..';
import { Product } from 'src/app/core/models/products/product.model';
import { ProductStrings } from 'src/app/core/models/products/product-strings.model';

@Injectable()
export class UserStoreEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private store$: Store<RootStoreState.State>,
  ) { }

  @Effect()
  userDataRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.UserDataRequested>(
      userFeatureActions.ActionTypes.USER_DATA_REQUESTED
    ),
    switchMap(action =>
      this.userService.fetchUserData(action.payload.userId)
        .pipe(
          map(user => new userFeatureActions.UserDataLoaded({userData: user})),
          catchError(error => {
            return of(new userFeatureActions.LoadErrorDetected({ error }));
          })
        )
    )
  );

  @Effect()
  storeUserDataRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.StoreUserDataRequested>(
      userFeatureActions.ActionTypes.STORE_USER_DATA_REQUESTED
    ),
    switchMap(action =>
      this.userService.storeUserData(action.payload.userData)
      .pipe(
        tap(userId => {
          // After data is stored, fetch it to update user data in local store for immediate UI updates
          this.store$.dispatch(
            new userFeatureActions.UserDataRequested({userId})
          );
        }),
        map(appUser => new userFeatureActions.StoreUserDataComplete()),
        catchError(error => {
          return of(new userFeatureActions.LoadErrorDetected({ error }));
        })
      )
    )
  );

  @Effect({dispatch: false})
  setProductInLocalStorage$: Observable<Action | Product> = this.actions$.pipe(
    ofType<userFeatureActions.SetCartData>(
      userFeatureActions.ActionTypes.SET_CART_DATA
    ),
    map(action => action.payload.productData),
    tap(productData => {
      localStorage.setItem(ProductStrings.OFFLINE_PRODUCT_DATA, JSON.stringify(productData));
    })
  );

  @Effect({dispatch: false})
  removeProductFromLocalStorage$: Observable<Action | Product> = this.actions$.pipe(
    ofType<userFeatureActions.PurgeCartData>(
      userFeatureActions.ActionTypes.PURGE_CART_DATA
    ),
    tap(() => {
      localStorage.removeItem(ProductStrings.OFFLINE_PRODUCT_DATA);
    })
  );

  @Effect()
  subscribeUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.SubscribeUserRequested>(
      userFeatureActions.ActionTypes.SUBSCRIBE_USER_REQUESTED
    ),
    switchMap(action =>
      this.userService.publishEmailSubToAdminTopic(action.payload.emailSubData)
        .pipe(
          map(response => new userFeatureActions.SubscribeUserComplete()),
          catchError(error => {
            return of(new userFeatureActions.LoadErrorDetected({ error }));
          })
        )
    )
  );
}
