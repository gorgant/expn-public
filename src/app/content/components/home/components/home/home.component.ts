import { Component, OnInit } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { ProductIdList, SandboxProductIdList } from 'src/app/core/models/products/product-id-list.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private currentEnvironmentType: boolean = environment.production;
  productIdList;

  heroData: PageHeroData;
  appRoutes = AppRoutes;

  constructor() { }

  ngOnInit() {

    this.setProductPathsBasedOnEnvironment();

    const blogImageProps: ImageProps = {
      src: ImagePaths.HOME,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Communicate with Clarity and Purpose',
      pageSubtitle: null,
      imageProps: blogImageProps,
      actionMessage: 'Learn More'
    };
  }

  private setProductPathsBasedOnEnvironment() {
    switch (this.currentEnvironmentType) {
      case true:
        console.log('Setting productIdList to production');
        this.productIdList = ProductIdList;
        break;
      case false:
        console.log('Setting productIdList to sandbox');
        this.productIdList = SandboxProductIdList;
        break;
      default:
        this.productIdList = SandboxProductIdList;
        break;
    }
  }

}
