import { Injectable } from '@angular/core';
import { DataLayerService, } from './data-layer.service';
import { PartialCustomDimensionsSet } from '../../models/analytics/custom-dimensions-set.model';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NavigationStamp } from '../../models/analytics/navigation-stamp.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { now } from 'moment';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, UserStoreActions } from 'src/app/root-store';
import { withLatestFrom, takeWhile } from 'rxjs/operators';
import { PublicUser } from '../../models/user/public-user.model';

// Courtesy of: https://medium.com/quick-code/set-up-analytics-on-an-angular-app-via-google-tag-manager-5c5b31e6f41
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private tempNavStampData: NavigationStamp;
  private navStampId: string;
  private navStampCreated: boolean;
  private tempUserData: PublicUser;

  constructor(
    private dataLayerCustomDimensions: DataLayerService,
    private titleService: Title,
    private router: Router,
    private afs: AngularFirestore, // Used exclusively to generate an id
    private store$: Store<RootStoreState.State>,
  ) { }

  /**
   * Push both page view and custom dimensions (if any) to data layer
   * @url the url after redirects are complete
   * @customDimensions custom dimensions to push to data layer
   * @overridePath optional override the page view url sent to GTM
   */
  logPageViewWithCustomDimensions(customDimensions?: PartialCustomDimensionsSet, overridePath?: string) {
    if (!customDimensions) {
      customDimensions = {};
    }
    this.updateCustomDimensions(customDimensions);
    this.logPageView(overridePath);
  }

  private updateCustomDimensions(customDimensions: PartialCustomDimensionsSet) {
    this.dataLayerCustomDimensions.dimensions = customDimensions;
    this.dataLayerCustomDimensions.trigger(); // Push custom dimensions to data layer via service
  }

  private logPageView(overridePath: string) {

    const url = this.router.url;
    const title = this.titleService.getTitle();

    // Create page view object
    const pageViewObject = {
      event: 'virtualPageview',
      virtualPagePath: overridePath || url,
      virtualPageTitle: overridePath || title,
    };

    (window as any).dataLayer.push(pageViewObject); // Push page view to datalayer
  }

  createNavStamp() {
    this.navStampCreated = false;
    this.navStampId = this.afs.createId();

    this.store$.select(UserStoreSelectors.selectUser)
      .pipe(
        takeWhile(() => !this.navStampCreated),
        withLatestFrom(this.store$.select(UserStoreSelectors.selectUserSessionid)),
      ).subscribe(([user, sessionId]) => {
        if (user && sessionId) {
          const navStamp: NavigationStamp = {
            id: this.navStampId,
            pagePath: this.router.url,
            pageOpenTime: now(),
            sessionId
          };
          this.store$.dispatch(new UserStoreActions.StoreNavStampRequested({user, navStamp}));
          this.navStampCreated = true; // Closes the subscription

          // Set temp instance variables
          this.tempNavStampData = navStamp;
          this.tempUserData = user;
        }
      });
  }

  closeNavStamp() {
    const user = this.tempUserData;
    const navStamp: NavigationStamp = {
      ...this.tempNavStampData,
      pageCloseTime: now(),
      pageViewDuration: now() - this.tempNavStampData.pageOpenTime
    };
    this.store$.dispatch(new UserStoreActions.StoreNavStampRequested({user, navStamp}));

    // Clear temp instance variables
    this.tempNavStampData = null;
    this.tempUserData = null;
  }

}
