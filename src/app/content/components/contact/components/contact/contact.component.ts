import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'shared-models/images/image-props.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { metaTagDefaults, metaTagsContentPages } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {

  heroData: PageHeroData;

  constructor(
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.initializeHeroData();
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const title = metaTagsContentPages.expnPublic.contactMetaTitle;
    // tslint:disable-next-line:max-line-length
    const description = metaTagsContentPages.expnPublic.contactMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.CONTACT;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  private initializeHeroData() {
    const aboutImageProps: ImageProps = {
      src: PublicImagePaths.CONTACT,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: metaTagsContentPages.expnPublic.contactPageTitle,
      pageHeroSubtitle: metaTagsContentPages.expnPublic.contactPageHeroSubtitle,
      imageProps: aboutImageProps,
      actionMessage: metaTagsContentPages.expnPublic.contactActionMessage
    };
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
