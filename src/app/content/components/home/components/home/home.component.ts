import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { ProductIdList, ProductUrlSlugList } from 'src/app/core/models/products/product-id-list.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { environment } from 'src/environments/environment';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private productionEnvironment: boolean = environment.production;
  remoteCoachProductId: string;
  remoteCoachUrlSlug: string;

  heroData: PageHeroData;
  appRoutes = PublicAppRoutes;

  constructor(
    private analyticsService: AnalyticsService,
  ) { }

  ngOnInit() {
    this.initializeHeroData();
    this.configSeoAndAnalytics();
    this.setProductPathsBasedOnEnvironment();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const title = `Explearning - Communicate With Clarity`;
    // tslint:disable-next-line:max-line-length
    const description = `Improve your speaking skills and communication skills with research-backed techniques to ensure effective communication. We teach you public speaking techniques, interview strategies, negotiation tactics, and much more. Our goal is to make you the best communicator you can be.`;
    const localImagePath = this.heroData.imageProps.src;

    this.analyticsService.setSeoTags(title, description, localImagePath);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
  }

  private setProductPathsBasedOnEnvironment() {
    switch (this.productionEnvironment) {
      case true:
        console.log('Setting productIdList to production');
        this.remoteCoachProductId = ProductIdList.REMOTE_COACH;
        this.remoteCoachUrlSlug = ProductUrlSlugList.REMOTE_COACH;
        break;
      case false:
        console.log('Setting productIdList to sandbox');
        this.remoteCoachProductId = ProductIdList.SANDBOX_REMOTE_COACH;
        this.remoteCoachUrlSlug = ProductUrlSlugList.SANDBOX_REMOTE_COACH;
        break;
      default:
        this.remoteCoachProductId = ProductIdList.SANDBOX_REMOTE_COACH;
        this.remoteCoachUrlSlug = ProductUrlSlugList.SANDBOX_REMOTE_COACH;
        break;
    }
  }

  private initializeHeroData() {
    const imageProps: ImageProps = {
      src: PublicImagePaths.HOME,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Communicate with Clarity and Purpose',
      pageSubtitle: null,
      imageProps,
      actionMessage: 'Learn More'
    };
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
