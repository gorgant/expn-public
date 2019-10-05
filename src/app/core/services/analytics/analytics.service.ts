import { Injectable, Inject } from '@angular/core';
import { DataLayerService, } from './data-layer.service';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { now } from 'moment';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, UserStoreActions, UiStoreSelectors } from 'src/app/root-store';
import { withLatestFrom, takeWhile } from 'rxjs/operators';
import { Location, DOCUMENT } from '@angular/common';
import { NavigationStamp } from 'shared-models/analytics/navigation-stamp.model';
import { PublicUser } from 'shared-models/user/public-user.model';
import { PartialCustomDimensionsSet } from 'shared-models/analytics/custom-dimensions-set.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';

// Courtesy of: https://medium.com/quick-code/set-up-analytics-on-an-angular-app-via-google-tag-manager-5c5b31e6f41
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private tempNavStampData: NavigationStamp;
  private navStampId: string;
  private navStampCreated: boolean;
  private tempUserData: PublicUser;

  private canonicalLink: HTMLLinkElement;

  private isBot: boolean;

  constructor(
    private dataLayerCustomDimensions: DataLayerService,
    private titleService: Title,
    private metaTagService: Meta,
    private router: Router,
    private afs: AngularFirestore, // Used exclusively to generate an id
    private store$: Store<RootStoreState.State>,
    private location: Location,
    @Inject(DOCUMENT) private domDoc: Document
  ) {
    this.checkForBot();
  }

  private checkForBot() {
    this.store$.select(UiStoreSelectors.selectBotDetected)
      .subscribe(isBot => {
        if (isBot) {
          this.isBot = true;
        }
      });
  }

  /**
   * Push both page view and custom dimensions (if any) to data layer
   * @url the url after redirects are complete
   * @customDimensions custom dimensions to push to data layer
   * @overridePath optional override the page view url sent to GTM
   */
  logPageViewWithCustomDimensions(overridePath: string, customDimensions?: PartialCustomDimensionsSet): void {

    // Exit function if bot
    if (this.isBot) {
      console.log('Bot detected, not logging page view');
      return;
    }

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

    const path = this.router.url; // Will include parameters
    const title = this.titleService.getTitle();
    const fullUrl = this.getFulllUrl(path);

    // Create page view object
    const pageViewObject = {
      event: 'virtualPageview',
      virtualPagePath: overridePath || path, // Prefer overridePath to avoid parameters
      virtualPageTitle: title,
      virtualPageLocation: fullUrl
    };

    (window as any).dataLayer.push(pageViewObject); // Push page view to datalayer
  }

  createNavStamp(path: string): void {

    // Exit function if bot
    if (this.isBot) {
      console.log('Bot detected, not logging page view');
      return;
    }

    this.navStampCreated = false;
    this.navStampId = this.afs.createId();

    this.store$.select(UserStoreSelectors.selectUser)
      .pipe(
        takeWhile(() => !this.navStampCreated),
        withLatestFrom(this.store$.select(UserStoreSelectors.selectUserSessionid)),
      ).subscribe(([user, sessionId]) => {
        if (user && sessionId) {

          const fullUrl = this.getFulllUrl(this.router.url); // Path with any potential params
          const navStamp: NavigationStamp = {
            id: this.navStampId,
            pagePath: path,
            pageLocation: fullUrl,
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

    // Exit function if bot
    if (this.isBot) {
      console.log('Bot detected, not logging page view');
      return;
    }

    if (this.tempNavStampData && this.tempNavStampData.pageOpenTime) {
      const user = this.tempUserData;
      const navStamp: NavigationStamp = {
        ...this.tempNavStampData,
        pageCloseTime: now(),
        pageViewDuration: now() - this.tempNavStampData.pageOpenTime
      };
      this.store$.dispatch(new UserStoreActions.StoreNavStampRequested({user, navStamp}));
    }

    // Clear temp instance variables
    this.tempNavStampData = null;
    this.tempUserData = null;
  }

  private getFulllUrl(path: string) {
    const origin = this.location[`_platformStrategy`]._platformLocation.location.origin;
    let fullPath: string;

    // Handle possible preceding slash
    if (path.charAt(0) === '/') {
      fullPath = `${origin}${path}`;
    } else {
      fullPath = `${origin}/${path}`;
    }
    return fullPath;
  }

  private getFullImagePath(path: string) {
    if (path.includes('https://')) {
      return path;
    }
    const origin = this.location[`_platformStrategy`]._platformLocation.location.origin;
    const imagePath = `${origin}/${path}`;
    return imagePath;
  }

  setSeoTags(title: string, description: string, imagePath: string, urlPath: string, keywords?: string, type?: string) {

    const fullImagePath = this.getFullImagePath(imagePath);
    // const url = this.fullUrlPath();
    const canonicalUrl = this.getFulllUrl(urlPath);

    this.titleService.setTitle(title);
    this.metaTagService.updateTag({
      name: 'description',
      content: description
    });
    this.metaTagService.updateTag({
      name: 'keywords',
      content: keywords ? keywords : metaTagDefaults.explearningPublic.metaTagDefaultKeywords
    });

    // Social Media Tags
    this.metaTagService.updateTag({
      property: 'og:title',
      content: title
    });
    this.metaTagService.updateTag({
      property: 'og:description',
      content: description
    });
    this.metaTagService.updateTag({
      property: 'og:image',
      content: fullImagePath
    });
    this.metaTagService.updateTag({
      property: 'og:image:secure_url',
      content: fullImagePath
    });
    this.metaTagService.updateTag({
      property: 'og:image:alt',
      content: title
    });
    this.metaTagService.updateTag({
      property: 'og:url',
      content: canonicalUrl
    });
    this.metaTagService.updateTag({
      property: 'og:type',
      content: type ? type : 'website'
    });

    // Twitter Tags
    this.metaTagService.updateTag({
      name: 'twitter:title',
      content: title,
    });
    this.metaTagService.updateTag({
      name: 'twitter:description',
      content: description,
    });
    this.metaTagService.updateTag({
      name: 'twitter:image:src',
      content: fullImagePath,
    });
    this.metaTagService.updateTag({
      name: 'twitter:image:alt',
      content: title
    });

    // Google+ Tags
    // These require the selector to be specified, otherwise forms duplicate
    this.metaTagService.updateTag({
      itemprop: 'name',
      content: title
    },
    `itemprop='name'`
    );
    this.metaTagService.updateTag({
      itemprop: 'description',
      content: description
    },
    `itemprop='description'`
    );
    this.metaTagService.updateTag({
      itemprop: 'image',
      content: fullImagePath
    },
    `itemprop='image'`
    );

    // Set canonical link (create and append new one if doesn't exist)
    if (!this.canonicalLink) {
      this.canonicalLink = this.domDoc.createElement('link');
      this.canonicalLink.setAttribute('rel', 'canonical');
      this.domDoc.head.appendChild(this.canonicalLink);
    }
    this.canonicalLink.setAttribute('href', canonicalUrl);

  }



}
