import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {

  heroData: PageHeroData;

  constructor(
    private titleService: Title,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
    this.initializeHeroData();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {
    this.titleService.setTitle(`Explearning - Contact Me`);
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
