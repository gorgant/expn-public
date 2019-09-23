import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'shared-models/images/image-props.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {

  heroData: PageHeroData;

  constructor(
    private analyticsService: AnalyticsService,
  ) { }

  ngOnInit() {
    this.initializeHeroData();
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {
    const title = `About Me - ${metaTagDefaults.explearningPublic.metaTagSiteName}`;
    // tslint:disable-next-line:max-line-length
    const description = `Speaking skills and effective communication are at the core of who we are. My goal is to equip you for personal and professional success by improving your speaking skills and communication skills using our research-backed techniques. With an Ed.M from Columbia University, I've been teaching and coaching communications for over ten years.`;
    const localImagePath = metaTagDefaults.explearningPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.ABOUT_ME;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  private initializeHeroData() {
    const aboutImageProps: ImageProps = {
      src: PublicImagePaths.ABOUT_ME,
      sizes: null,
      srcset: null,
      width: null,
    };

    // Text is added in-line because layout is specific to About Me page
    this.heroData = {
      pageTitle: null,
      pageSubtitle: null,
      imageProps: aboutImageProps,
      actionMessage: 'Read More'
    };
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
