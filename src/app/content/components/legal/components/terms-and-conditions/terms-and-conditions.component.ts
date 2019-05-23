import { Component, OnInit } from '@angular/core';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {

  appRoutes = PublicAppRoutes;

  constructor(
    private titleService: Title,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {
    this.titleService.setTitle(`Explearning - Terms and Conditions`);
    this.analyticsService.logPageViewWithCustomDimensions();
  }

}
