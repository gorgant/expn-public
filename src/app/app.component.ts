import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { UiService } from './core/services/ui.service';
import { MatSidenav, MatDialogConfig, MatDialog } from '@angular/material';
import { AuthService } from './core/services/auth.service';
import { Store } from '@ngrx/store';
import {
  RootStoreState,
  UserStoreSelectors,
  AuthStoreSelectors,
  AuthStoreActions,
  UserStoreActions,
  UiStoreActions,
  UiStoreSelectors
} from './root-store';
import { withLatestFrom, map, takeWhile, filter, tap, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { ProductStrings } from 'shared-models/products/product-strings.model';
import { Product } from 'shared-models/products/product.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { Meta } from '@angular/platform-browser';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { DownloadPromoComponent } from './shared/components/email-collection/download-promo/download-promo.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = metaTagDefaults.explearningPublic.metaTagDefaultTitle;
  appVersion = '1.9.0';

  private userAuthenticationRequested: boolean;
  private userLoaded: boolean;
  private routeNavCount = 0;
  cachedHtmlActive$: Observable<boolean>;
  private isBot: boolean;
  private isAngularUniversal: boolean;
  private promoFired: boolean;
  private queryParamsSubscription: Subscription;

  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;

  constructor(
    private uiService: UiService,
    private authService: AuthService,
    private store$: Store<RootStoreState.State>,
    private afs: AngularFirestore,
    private metaTagService: Meta,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: {},
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkForBot();
    this.checkIfCachedHtml();
    this.monitorCachedHtmlStatus();
    this.detectRouteChange();
    this.setUserSessionId();
    this.configureSideNav();
    this.configureAuthDetection();
    this.checkForOfflineProductData();
    this.initializePublicUser();
    this.initializeDownloadPromo();
  }

  private initializeDownloadPromo() {

    // Only run popup if human user
    if (!this.isAngularUniversal && !this.isBot) {

      // Note the queryParams don't get set until after init, so this needs to be a dynamic subscription
      this.queryParamsSubscription = this.route.queryParams.subscribe(params => {

        const popupDelay = 10000;
        const instaPopTrigger = 'smallTalk';
        const instaPop = params[instaPopTrigger];

         // If popup query param is present, no popup delay
        if (instaPop && !this.promoFired) {
          console.log('InstaPop detected', instaPop);
          this.firePopup();
        }

        setTimeout(() => {
          if (!this.promoFired) {
            this.firePopup();
          }
        }, popupDelay);

      });
    }
  }

  // Trigger popup on a delay basis
  private firePopup() {

    this.store$.select(UserStoreSelectors.selectUser)
      .pipe(take(1))
      .subscribe(user => {

        // Check if user email already exists
        if (user && user.billingDetails && user.billingDetails.email) {
          console.log('Email already collected, no popup');
          return;
        }

        if (this.promoFired) {
          console.log('Promo already fired, canceling duplicate');
          return;
        }

        console.log('Popup activated');
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = '';
        dialogConfig.autoFocus = true;
        dialogConfig.minWidth = 300;
        dialogConfig.panelClass = 'download-promo-wrapper'; // CSS for this class set globally in styles.scss

        const dialogRef = this.dialog.open(DownloadPromoComponent, dialogConfig);
        this.promoFired = true; // prevents duplicates from firing
      });
    this.queryParamsSubscription.unsubscribe(); // close out the queryParam subscription
  }

  private checkForBot() {
    const botMetaTag = this.metaTagService.getTag(`name=${metaTagDefaults.explearningPublic.metaTagIsBot}`);
    if (botMetaTag) {
      this.store$.dispatch(new UiStoreActions.BotDetected());
      console.log('Bot detected', botMetaTag);
    } else if (isPlatformServer(this.platformId)) {
      this.store$.dispatch(new UiStoreActions.AngularUniversalDetected());
    } else {
      console.log('No bot or angular universal detected');
    }

    // Keep this updated in the app component state;
    this.store$.select(UiStoreSelectors.selectBotDetected)
      .subscribe(isBot => {
        if (isBot) {
          this.isBot = true;
        }
      });

    // Keep this updated in the app component state;
    this.store$.select(UiStoreSelectors.selectAngularUniversalDetected)
      .subscribe(isAngularUniversal => {
        if (isAngularUniversal) {
          this.isAngularUniversal = true;
        }
      });
  }

  private checkIfCachedHtml() {
    const cachedMetaTag = this.metaTagService.getTag(`name=${metaTagDefaults.explearningPublic.metaTagCachedHtml}`);
    if (cachedMetaTag) {
      this.store$.dispatch(new UiStoreActions.HTMLCacheActivated());
      console.log('Cached content detected', cachedMetaTag);
      return true;
    }
    console.log('No cached content detected');
    return false;
  }

  // Used to turn off HTML Cache async logic
  private detectRouteChange() {
    this.router.events.pipe(
      takeWhile(() => this.routeNavCount < 2),
      filter(event =>
        event instanceof NavigationStart
      ),
      tap(event => {
        console.log('Router change detected');
        this.routeNavCount++;
        if (this.routeNavCount > 1) {
          this.store$.dispatch(new UiStoreActions.HTMLCacheDeactivated());
          console.log('Valid router nav detected');
        }
      })
    ).subscribe();
  }

  private monitorCachedHtmlStatus() {
    this.cachedHtmlActive$ = this.store$.select(UiStoreSelectors.selectHTMLCacheActive)
      .pipe(map(htmlCacheActive => htmlCacheActive));
  }

  private setUserSessionId() {
    const userSessionId = this.afs.createId();
    this.store$.dispatch(new UserStoreActions.SetUserSessionId({userSessionId}));
  }

  private initializePublicUser() {

    // Don't init user if bot
    if (this.isBot) {
      console.log('Bot detected, not initializing user');
      return;
    }

    // Don't init user if Angular Universal rendering
    if (this.isAngularUniversal) {
      console.log('Angular Universal detected, not initializing user');
      return;
    }

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

    // Don't detect auth if bot
    if (this.isBot) {
      console.log('Bot detected, not initializing auth detection');
      return;
    }

    // Don't detect auth if Angular Universal rendering
    if (this.isAngularUniversal) {
      console.log('Angular Universal detected, not initializing auth detection');
      return;
    }


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
    // Don't check for offline product if bot
    if (this.isBot) {
      console.log('Bot detected, not initializing offline data');
      return;
    }

    // Don't check for offline product if Angular Universal rendering
    if (this.isAngularUniversal) {
      console.log('Angular Universal detected, not initializing offline data');
      return;
    }

    const offlineProductData = localStorage.getItem(ProductStrings.OFFLINE_PRODUCT_DATA);
    if (offlineProductData) {
      const productData: Product = JSON.parse(localStorage.getItem(ProductStrings.OFFLINE_PRODUCT_DATA));
      this.store$.dispatch(new UserStoreActions.SetCartData({productData}));
    }
  }
}
