import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/core/models/products/product.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, AuthStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { PublicUser } from 'src/app/core/models/user/public-user.model';
import { withLatestFrom, map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit {

  product$: Observable<Product>;
  publicUser$: Observable<PublicUser>;
  userAuthenticationRequested: boolean;

  imagePaths = ImagePaths;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
  ) { }

  ngOnInit() {
    this.initializeProductData();
    this.initializePublicUser();
  }

  private initializePublicUser() {
    this.publicUser$ = this.store$.select(UserStoreSelectors.selectUser)
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

    this.product$
      .pipe(take(1))
      .subscribe(product => {
        if (!product) {
          console.log('No product detected in cart, routing to home page');
          this.router.navigate([AppRoutes.HOME]);
        }
      });
  }

}
