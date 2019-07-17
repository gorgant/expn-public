import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit, OnDestroy {

  appRoutes = PublicAppRoutes;

  constructor(
    private titleService: Title,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
    this.analyticsService.createNavStamp();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {
    this.titleService.setTitle(`Terms and Conditions - ${metaTagDefaults.explearningPublic.metaTagSiteName}`);
    this.analyticsService.logPageViewWithCustomDimensions();
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
