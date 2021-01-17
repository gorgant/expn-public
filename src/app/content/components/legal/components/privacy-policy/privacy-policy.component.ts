import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { metaTagsContentPages } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { LegalBusinessNames, ShorthandBusinessNames } from 'shared-models/forms-and-components/legal-vars.model';
import { BlogDomains } from 'shared-models/posts/blog-domains.model';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {

  legalBusinessName = LegalBusinessNames.EXPN;
  shorthandBusinessName = ShorthandBusinessNames.EXPN;
  businessDomain = BlogDomains.EXPN;

  constructor(
    private titleService: Title,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const title = metaTagsContentPages.expnPublic.privacyPolicyMetaTitle;
    const canonicalUrlPath = PublicAppRoutes.PRIVACY_POLICY;

    this.titleService.setTitle(title);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
