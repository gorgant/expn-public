import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { ImageProps } from 'shared-models/images/image-props.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-podcast',
  templateUrl: './podcast.component.html',
  styleUrls: ['./podcast.component.scss']
})
export class PodcastComponent implements OnInit, OnDestroy {

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

    const title = `Podcast - ${metaTagDefaults.explearningPublic.metaTagSiteName}`;
    // tslint:disable-next-line:max-line-length
    const description = `Get our lastest communications strategies in audio form from our weekly Explearning podcast. Available on all the major directories, including Soundlcoud, iTunes, Google Podcast, Spotify, and more.`;
    const localImagePath = metaTagDefaults.explearningPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.PODCAST;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  private initializeHeroData() {
    const imgProps: ImageProps = {
      src: PublicImagePaths.PODCAST,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Podcast',
      pageHeroSubtitle: 'Get our lastest communications strategies in audio form',
      imageProps: imgProps,
      actionMessage: 'View Episodes'
    };
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
