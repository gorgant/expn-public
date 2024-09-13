import { Component, inject, OnInit } from '@angular/core';
import { LegalBusinessNames } from '../../../../../shared-models/meta/business-info.model';
import { BlogDomains } from '../../../../../shared-models/posts/blog-domains.model';
import { PublicAppRoutes } from '../../../../../shared-models/routes-and-paths/app-routes.model';
import { SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { metaTagDefaults } from '../../../../../shared-models/meta/metatags.model';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.scss'
})
export class TermsAndConditionsComponent implements OnInit {

  appRoutes = PublicAppRoutes;
  legalBusinessName = LegalBusinessNames.EXPN;
  businessDomain = BlogDomains.EXPN;

  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.configSeoAndAnalytics();
  }

  private configSeoAndAnalytics() {

    const title = SiteSpecificFieldValues.expnPublic.termsAndConditionsMetaTitle;
    const description = SiteSpecificFieldValues.expnPublic.termsAndConditionsMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.TERMS_AND_CONDITIONS;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }

}
