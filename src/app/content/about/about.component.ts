import { Component, OnInit, inject } from '@angular/core';
import { AboutHeroComponent } from "./about-hero/about-hero.component";
import { AboutBodyComponent } from "./about-body/about-body.component";
import { SiteSpecificFieldValues } from '../../../../shared-models/content/string-vals.model';
import { metaTagDefaults } from '../../../../shared-models/meta/metatags.model';
import { PublicAppRoutes } from '../../../../shared-models/routes-and-paths/app-routes.model';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
    imports: [AboutHeroComponent, AboutBodyComponent]
})
export class AboutComponent implements OnInit {
  
  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.configSeoAndAnalytics();
  }

  private configSeoAndAnalytics() {

    const title = SiteSpecificFieldValues.expnPublic.aboutMetaTitle;
    const description = SiteSpecificFieldValues.expnPublic.aboutMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.ABOUT_ME;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }
}
