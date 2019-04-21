import { Component, OnInit, Input } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { BuyNowBoxData } from 'src/app/core/models/forms-and-components/buy-now-box-data.model';
import { TestamonialData } from 'src/app/core/models/forms-and-components/testamonial-data.model';
import { Observable } from 'rxjs';
import { Product } from 'src/app/core/models/products/product.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState } from 'src/app/root-store';
import { testamonialsList } from 'src/app/core/models/forms-and-components/testamonials.model';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit {

  heroData: PageHeroData;
  buyNowData: BuyNowBoxData;
  testamonialData: TestamonialData[];
  productData$: Observable<Product>;
  imagePaths = ImagePaths;

  constructor(
  ) { }

  ngOnInit() {
    this.initializeHeroData();
    this.initializeBuyNowData();
    this.initializeTestamonialData();
    this.initializeProductData();
  }

  private initializeHeroData() {
    this.heroData = {
      pageTitle: 'Remote Coach',
      pageSubtitle: 'Get professional, personalized feedback on your communication style, anywhere in the world',
      imageUrl: ImagePaths.REMOTE_COACH,
      actionMessage: 'Learn More'
    };
  }

  private initializeProductData() {
    // TODO: Fetch product data via url param
  }

  private initializeBuyNowData() {
    this.buyNowData = {
      title: 'Remote Coach',
      subtitle: 'Get professional, personalized feedback',
      buttonText: 'Get Started - $199'
    };
  }

  private initializeTestamonialData() {
    this.testamonialData = testamonialsList;
  }

}
