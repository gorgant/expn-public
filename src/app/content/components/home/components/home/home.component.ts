import { Component, OnInit } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { ProductIdList } from 'src/app/core/models/products/product-id-list.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  heroData: PageHeroData;
  appRoutes = AppRoutes;
  productIds = ProductIdList;

  constructor() { }

  ngOnInit() {

    const blogImageProps: ImageProps = {
      src: ImagePaths.HOME,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Communications Coaching & Strategies',
      pageSubtitle: null,
      imageProps: blogImageProps,
      actionMessage: 'Learn More'
    };
  }

}
