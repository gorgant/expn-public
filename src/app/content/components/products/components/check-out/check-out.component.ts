import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from 'src/app/core/models/products/product.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, AuthStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { PublicUser } from 'src/app/core/models/user/public-user.model';
import { withLatestFrom, map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit, OnDestroy {

  product$: Observable<Product>;
  publicUser$: Observable<PublicUser>;
  userAuthenticationRequested: boolean;

  imagePaths = PublicImagePaths;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private titleService: Title,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
    this.initializeProductData();
    this.initializePublicUser();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {
    this.titleService.setTitle(`Checkout - Explearning`);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
  }

  private initializePublicUser() {
    this.publicUser$ = this.store$.select(UserStoreSelectors.selectUser); // User initialized in app component
      // .pipe(
      //   withLatestFrom(
      //     this.store$.select(UserStoreSelectors.selectUserLoaded)
      //   ),
      //   map(([user, userLoaded]) => {
      //     if (!userLoaded && !this.userAuthenticationRequested) {
      //       console.log('No user in store, dispatching authentication request');
      //       this.store$.dispatch(new AuthStoreActions.AuthenticationRequested());
      //     }
      //     this.userAuthenticationRequested = true; // Prevents auth from firing multiple times
      //     return user;
      //   })
      // );
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
          this.router.navigate([PublicAppRoutes.HOME]);
        }
      });
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
