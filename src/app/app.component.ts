import { Component, OnInit, ViewChild } from '@angular/core';
import { UiService } from './core/services/ui.service';
import { MatSidenav } from '@angular/material';
import { AuthService } from './core/services/auth.service';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, AuthStoreSelectors, AuthStoreActions, UserStoreActions } from './root-store';
import { withLatestFrom } from 'rxjs/operators';
import { ProductStrings } from './core/models/products/product-strings.model';
import { Product } from './core/models/products/product.model';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Explearning';
  appVersion = '1.2.0';

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private uiService: UiService,
    private authService: AuthService,
    private store$: Store<RootStoreState.State>,
    private router: Router,
  ) {}

  ngOnInit() {
    this.configureSideNav();
    this.configureAuthDetection();
    this.checkForOfflineProductData();
    this.monitorRoutes();
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
    this.authService.authStatus
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

  private monitorRoutes() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (window as any).ga('set', 'page', event.urlAfterRedirects);
        (window as any).ga('send', 'pageview');
        console.log('Page change detected', event.urlAfterRedirects);
      }
    });
  }
}
