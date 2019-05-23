import { Injectable } from '@angular/core';
import { DataLayerService, } from './data-layer.service';
import { PartialCustomDimensionsSet } from '../../models/analytics/custom-dimensions-set.model';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Courtesy of: https://medium.com/quick-code/set-up-analytics-on-an-angular-app-via-google-tag-manager-5c5b31e6f41
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    private dataLayerCustomDimensions: DataLayerService,
    private titleService: Title,
    private router: Router
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
    console.log('Pushed pageview to datalayer');
  }


}
