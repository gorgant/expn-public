import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/core/models/products/product.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, AuthStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { withLatestFrom, map } from 'rxjs/operators';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit {

  product$: Observable<Product>;
  anonymousUser$: Observable<AnonymousUser>;
  userAuthenticationRequested: boolean;

  imagePaths = ImagePaths;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializeProductData();
    this.initializeAnonymousUser();
  }

  private initializeAnonymousUser() {
    this.anonymousUser$ = this.store$.select(UserStoreSelectors.selectAppUser)
      .pipe(
        withLatestFrom(
          this.store$.select(UserStoreSelectors.selectUserLoaded)
        ),
        map(([user, userLoaded]) => {
          if (!userLoaded && !this.userAuthenticationRequested) {
            console.log('No user in store, dispatching authentication request');
            this.store$.dispatch(new AuthStoreActions.AuthenticationRequested());
          }
          this.userAuthenticationRequested = true; // Prevents auth from firing multiple times
          return user;
        })
      );
  }

  private initializeProductData() {
    this.product$ = this.store$.select(
      UserStoreSelectors.selectCartData
    );
  }
}
