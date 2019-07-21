import { Component, OnInit, ViewChild } from '@angular/core';
import { UiService } from './core/services/ui.service';
import { MatSidenav } from '@angular/material';
import { AuthService } from './core/services/auth.service';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, AuthStoreSelectors, AuthStoreActions, UserStoreActions } from './root-store';
import { withLatestFrom, map, takeWhile } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';
import { AngularFirestore } from '@angular/fire/firestore';
import { AnalyticsService } from './core/services/analytics/analytics.service';
import { ProductStrings } from 'shared-models/products/product-strings.model';
import { Product } from 'shared-models/products/product.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = metaTagDefaults.explearningPublic.metaTagDefaultTitle;
  appVersion = '1.7.7';

  private userAuthenticationRequested: boolean;
  private userLoaded: boolean;

  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;

  constructor(
    private uiService: UiService,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private store$: Store<RootStoreState.State>,
    private metaTagService: Meta,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.setUserSessionId();
    this.configureSideNav();
    this.configureAuthDetection();
    this.checkForOfflineProductData();
    this.configSeoAndAnalytics();
    this.initializePublicUser();
  }

  private setUserSessionId() {
    const userSessionId = this.afs.createId();
    this.store$.dispatch(new UserStoreActions.SetUserSessionId({userSessionId}));
  }

  private initializePublicUser() {
    this.store$.select(UserStoreSelectors.selectUser)
      .pipe(
        takeWhile(() => !this.userLoaded),
        withLatestFrom(
          this.store$.select(UserStoreSelectors.selectUserLoaded)
        ),
        map(([user, userLoaded]) => {
          if (!userLoaded && !this.userAuthenticationRequested) {
            console.log('No user in store, dispatching authentication request');
            this.store$.dispatch(new AuthStoreActions.AuthenticationRequested());
          }
          this.userAuthenticationRequested = true; // Prevents auth from firing multiple times
          if (user) {
            this.userLoaded = true; // Mark user loaded to close the subscription
          }
          return user;
        })
      ).subscribe();
  }

  // Handles sideNav clicks
  private configureSideNav() {
    this.uiService.sideNavSignal$.subscribe(signal => {
      this.toggleSideNav();
    });
  }

  // Opens and closes sidenav
  private toggleSideNav() {
    if (this.sidenav.opened) {
      this.sidenav.close();
    } else {
      this.sidenav.open();
    }
  }

  private configureAuthDetection() {
    this.authService.initAuthListener();
    this.authService.authStatus$
    .pipe(
      withLatestFrom(
        this.store$.select(UserStoreSelectors.selectUserIsLoading),
        this.store$.select(AuthStoreSelectors.selectIsAuth)
      )
    )
    .subscribe(([userId, userIsLoading, isAuth]) => {
      // These if statements determine how to load user data
      if (userId && !userIsLoading && !isAuth) {
        // Fires only when app is loaded and user is already logged in
        this.store$.dispatch( new AuthStoreActions.AuthenticationComplete());
        this.store$.dispatch( new UserStoreActions.UserDataRequested({userId}));
      } else if (userId && !userIsLoading && isAuth) {
        // Fires only when user logged in via Google Auth
        this.store$.dispatch( new UserStoreActions.UserDataRequested({userId}));
      } else if (!userId && isAuth) {
        // Fires only when logout detected on separate client, logs out user automatically
        this.authService.logout();
        this.store$.dispatch(new AuthStoreActions.SetUnauthenticated());
      }
    });
  }

  private checkForOfflineProductData() {
    const offlineProductData = localStorage.getItem(ProductStrings.OFFLINE_PRODUCT_DATA);
    if (offlineProductData) {
      const productData: Product = JSON.parse(localStorage.getItem(ProductStrings.OFFLINE_PRODUCT_DATA));
      this.store$.dispatch(new UserStoreActions.SetCartData({productData}));
    }
  }

  private configSeoAndAnalytics() {

    const title = metaTagDefaults.explearningPublic.metaTagDefaultTitle;
    // tslint:disable-next-line:max-line-length
    const description = metaTagDefaults.explearningPublic.metaTagDefaultDescription;
    const localImagePath = PublicImagePaths.HOME;

    this.analyticsService.setSeoTags(title, description, localImagePath);

    this.metaTagService.addTags([
      // tslint:disable-next-line:max-line-length
      { name: 'keywords', content: metaTagDefaults.explearningPublic.metaTagDefaultKeywords },
      // tslint:disable-next-line:max-line-length
      { name: 'description', content: description },
      { name: 'author', content: metaTagDefaults.explearningPublic.metaTagAuthor },
      { name: 'twitter:site', content: metaTagDefaults.explearningPublic.metaTagTwitterHandle }, // Twitter analytics
      { name: 'twitter:card', content: metaTagDefaults.explearningPublic.metaTagTwitterCardType }, // Twitter card display properties
      { property: 'og:site_name', content: metaTagDefaults.explearningPublic.metaTagSiteName },
      { property: 'fb:app_id', content: metaTagDefaults.explearningPublic.metaTagFbAppId }, // Facebook analytics
    ]);
  }

}
