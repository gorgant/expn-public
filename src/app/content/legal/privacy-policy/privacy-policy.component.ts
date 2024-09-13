import { Component, inject, OnInit } from '@angular/core';
import { LegalBusinessNames, ShorthandBusinessNames } from '../../../../../shared-models/meta/business-info.model';
import { BlogDomains } from '../../../../../shared-models/posts/blog-domains.model';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { metaTagDefaults } from '../../../../../shared-models/meta/metatags.model';
import { PublicAppRoutes } from '../../../../../shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {
  
  legalBusinessName = LegalBusinessNames.EXPN;
  shorthandBusinessName = ShorthandBusinessNames.EXPN;
  businessDomain = BlogDomains.EXPN;

  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.configSeoAndAnalytics();
  }

  private configSeoAndAnalytics() {

    const title = SiteSpecificFieldValues.expnPublic.privacyPolicyMetaTitle;
    const description = SiteSpecificFieldValues.expnPublic.privacyPolicyMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.PRIVACY_POLICY;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }

}
