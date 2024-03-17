import { Component, OnInit, inject } from '@angular/core';
import { ContactHeroComponent } from "./contact-hero/contact-hero.component";
import { ContactFormComponent } from "./contact-form/contact-form.component";
import { SiteSpecificFieldValues } from '../../../../shared-models/content/string-vals.model';
import { metaTagDefaults } from '../../../../shared-models/meta/metatags.model';
import { PublicAppRoutes } from '../../../../shared-models/routes-and-paths/app-routes.model';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss',
    imports: [ContactHeroComponent, ContactFormComponent]
})
export class ContactComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.configSeoAndAnalytics();
  }

  private configSeoAndAnalytics() {

    const title = SiteSpecificFieldValues.expnPublic.contactMetaTitle;
    const description = SiteSpecificFieldValues.expnPublic.contactMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.CONTACT;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }
}
