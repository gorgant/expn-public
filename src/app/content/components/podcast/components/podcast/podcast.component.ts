import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { metaTagDefaults, metaTagsContentPages } from 'shared-models/analytics/metatags.model';
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
  podcastUrl = metaTagsContentPages.explearningPublic.podcastSoundCloudUrl;

  constructor(
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.initializeHeroData();
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const title = metaTagsContentPages.explearningPublic.podcastMetaTitle;
    // tslint:disable-next-line:max-line-length
    const description = metaTagsContentPages.explearningPublic.podcastMetaDescription;
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
      pageTitle: metaTagsContentPages.explearningPublic.podcastPageTitle,
      pageHeroSubtitle: metaTagsContentPages.explearningPublic.podcastPageHeroSubtitle,
      imageProps: imgProps,
      actionMessage: metaTagsContentPages.explearningPublic.podcastActionMessage
    };
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
