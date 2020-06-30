import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import * as userFeatureActions from './actions';
import { switchMap, map, catchError, tap, concatMap, mergeMap } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { RootStoreState } from '..';
import { Product } from 'shared-models/products/product.model';
import { ProductStrings } from 'shared-models/products/product-strings.model';

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
          map(user => {
            if (!user) {
              throw new Error('User not found');
            }
            return new userFeatureActions.UserDataLoaded({userData: user});
          }),
          catchError(error => {
            return of(new userFeatureActions.LoadFailed({ error }));
          })
        )
    )
  );

  @Effect()
  storeUserDataRequestedEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.StoreUserDataRequested>(
      userFeatureActions.ActionTypes.STORE_USER_DATA_REQUESTED
    ),
    concatMap(action =>
      this.userService.storeUserData(action.payload.userData)
      .pipe(
        tap(userId => {
          if (!userId) {
            throw new Error('User ID not found');
          }
          // After data is stored, fetch it to update user data in local store for immediate UI updates
          this.store$.dispatch(
            new userFeatureActions.UserDataRequested({userId})
          );
        }),
        map(userId => new userFeatureActions.StoreUserDataComplete()),
        catchError(error => {
          return of(new userFeatureActions.SaveFailed({ error }));
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
      if (localStorage) {
        localStorage.setItem(ProductStrings.OFFLINE_PRODUCT_DATA, JSON.stringify(productData));
      }
    })
  );

  @Effect({dispatch: false})
  removeProductFromLocalStorage$: Observable<Action | Product> = this.actions$.pipe(
    ofType<userFeatureActions.PurgeCartData>(
      userFeatureActions.ActionTypes.PURGE_CART_DATA
    ),
    tap(() => {
      if (localStorage && localStorage.getItem(ProductStrings.OFFLINE_PRODUCT_DATA)) {
        localStorage.removeItem(ProductStrings.OFFLINE_PRODUCT_DATA);
      }
    })
  );

  @Effect()
  subscribeUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.SubscribeUserRequested>(
      userFeatureActions.ActionTypes.SUBSCRIBE_USER_REQUESTED
    ),
    mergeMap(action =>
      this.userService.publishEmailSubToAdminTopic(action.payload.emailSubData)
        .pipe(
          map(response => {
            if (!response) {
              throw new Error('No response from subscribeUser function');
            }
            return new userFeatureActions.SubscribeUserComplete();
          }),
          catchError(error => {
            return of(new userFeatureActions.SubscribeUserFailed({ error }));
          })
        )
    )
  );

  @Effect()
  transmitContactFormEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.TransmitContactFormRequested>(
      userFeatureActions.ActionTypes.TRANSMIT_CONTACT_FORM_REQUESTED
    ),
    mergeMap(action =>
      this.userService.publishContactFormToAdminTopic(action.payload.contactForm)
        .pipe(
          map(response => {
            if (!response) {
              throw new Error('No response from public contact form function');
            }
            return new userFeatureActions.TransmitContactFormComplete();
          }),
          catchError(error => {
            return of(new userFeatureActions.TransmitContactFormFailed({ error }));
          })
        )
    )
  );

  @Effect()
  storeNavStampEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.StoreNavStampRequested>(
      userFeatureActions.ActionTypes.STORE_NAV_STAMP_REQUESTED
    ),
    mergeMap(action =>
      this.userService.storeNavStamp(action.payload.user, action.payload.navStamp)
        .pipe(
          map(response => {
            if (!response) {
              throw new Error('No response from store nave stamp request');
            }
            return new userFeatureActions.StoreNavStampComplete();
          }),
          catchError(error => {
            return of(new userFeatureActions.StoreNavStampFailed({ error }));
          })
        )
    )
  );

  @Effect()
  confirmSubscriberEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userFeatureActions.ConfirmSubOptInRequested>(
      userFeatureActions.ActionTypes.CONFIRM_SUB_OPT_IN_REQUESTED
    ),
    switchMap(action =>
      this.userService.confirmSubOnAdmin(action.payload.subConfData)
        .pipe(
          map(response => {
            if (!response) {
              throw new Error('No response from admin while confirming subscriber');
            }
            return new userFeatureActions.ConfirmSubOptInComplete();
          }),
          catchError(error => {
            return of(new userFeatureActions.ConfirmSubOptInFailed({ error }));
          })
        )
    )
  );
}
