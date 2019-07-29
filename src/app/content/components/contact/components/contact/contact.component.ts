import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'shared-models/images/image-props.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';

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

    const title = `Contact Me - ${metaTagDefaults.explearningPublic.metaTagSiteName}`;
    // tslint:disable-next-line:max-line-length
    const description = `Get in touch with the Explearning team using this contact form. We welcome questions, suggestions, and any thoughtful input. Let us know if there is anything else we can do to help you improve your speaking and communication skills!`;
    const localImagePath = metaTagDefaults.explearningPublic.metaTagDefaultImage;

    this.analyticsService.setSeoTags(title, description, localImagePath);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
  }

  private initializeHeroData() {
    const aboutImageProps: ImageProps = {
      src: PublicImagePaths.CONTACT,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Contact Me',
      pageSubtitle: 'Questions, suggestions, and thoughtful input are welcome',
      imageProps: aboutImageProps,
      actionMessage: 'Get in Touch'
    };
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
