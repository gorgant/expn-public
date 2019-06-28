import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Title, Meta } from '@angular/platform-browser';
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
    private metaTagService: Meta,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.initializeHeroData();
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const title = `Contact Me - Explearning`;
    // tslint:disable-next-line:max-line-length
    const description = `Get in touch with the Explearning team using this contact form. We welcome questions, suggestions, and any thoughtful input. Let us know if there is anything else we can do to help you improve your speaking and communication skills!`;
    const localImagePath = this.heroData.imageProps.src;

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
