import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {

  heroData: PageHeroData;

  constructor(
    private titleService: Title,
    private analyticsService: AnalyticsService,
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
    this.initializeHeroData();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {
    this.titleService.setTitle(`Explearning - About Me`);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
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
