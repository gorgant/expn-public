import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { BuyNowBoxData } from 'src/app/core/models/products/buy-now-box-data.model';
import { TestamonialData } from 'src/app/core/models/forms-and-components/testamonial-data.model';
import { Observable, Subscription } from 'rxjs';
import { Product } from 'src/app/core/models/products/product.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState } from 'src/app/root-store';
import { testamonialsList } from 'src/app/core/models/forms-and-components/testamonials.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductStoreSelectors, ProductStoreActions } from 'src/app/root-store/product-store';
import { withLatestFrom, map } from 'rxjs/operators';
import { ProductIdList } from 'src/app/core/models/products/product-id-list.model';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit, OnDestroy {

  productId: string;
  product$: Observable<Product>;
  error$: Observable<string>;
  errorSubscription: Subscription;
  productLoaded: boolean;
  private titleSet: boolean;
  productSubscription: Subscription;

  productIdList = ProductIdList;

  heroData: PageHeroData;
  buyNowData: BuyNowBoxData;
  testamonialData: TestamonialData[];
  imagePaths = PublicImagePaths;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  ngOnInit() {
    // this.setProductPathsBasedOnEnvironment();
    this.initializeProductData();
    this.handleProductError();
    this.initializePageComponents();
  }

  private configSeoAndAnalytics(product: Product) {

    const title = `${product.name} - Explearning`;
    const description = `${product.productCardData.tagline} ${product.productCardData.highlights.join('. ')}.`;
    const localImagePath = this.heroData.imageProps.src;

    this.analyticsService.setSeoTags(title, description, localImagePath);
    this.analyticsService.logPageViewWithCustomDimensions({});
    this.analyticsService.createNavStamp();
  }

  private initializeProductData() {
    // Check if id params are available
    const idParamName = 'id';
    const idParam = this.route.snapshot.params[idParamName];
    if (idParam) {
      this.productId = idParam.toLowerCase(); // Remove any possible erroneous lowercasing (IDs are specifically set to lower case in admin)
      this.getProduct();
    }
  }

  // Triggered after params are fetched
  private getProduct() {

    this.product$ = this.store$.select(ProductStoreSelectors.selectProductById(this.productId))
      .pipe(
        withLatestFrom(
          this.store$.select(ProductStoreSelectors.selectProductsLoaded)
        ),
        map(([product, productsLoaded]) => {
          // Check if items are loaded, if not fetch from server
          if (!productsLoaded && !this.productLoaded) {
            console.log('No products in store, fetching from server', this.productId);
            this.store$.dispatch(new ProductStoreActions.SingleProductRequested({productId: this.productId}));
          }
          this.productLoaded = true; // Prevents loading from firing more than needed
          return product;
        }),
      );

    this.error$ = this.store$.select(
      ProductStoreSelectors.selectProductError
    );
  }

  private initializePageComponents() {
    this.productSubscription = this.product$.subscribe(product => {
      if (product) {
        // Once data loaded, initialize the other elements
        this.initializeHeroData(product);
        this.initializeBuyNowData(product);
      }
    });
    this.initializeTestamonialData();
  }


  private initializeHeroData(product: Product) {
    console.log('Initializing hero data with this product', product);
    this.heroData = {
      ...product.heroData,
      imageProps: product.heroImageProps,
      actionMessage: 'Learn More'
    };

    if (product && !this.titleSet) {
      this.configSeoAndAnalytics(product); // Set page view once title is loaded
      this.titleSet = true;
    }
  }


  private initializeBuyNowData(product: Product) {
    console.log('Initializing buy now data with this product', product);
    this.buyNowData = {
      title: product.buyNowData.title,
      subtitle: product.buyNowData.subtitle,
      buttonText: `Get Started - $${product.price}`
    };
  }

  private initializeTestamonialData() {
    this.testamonialData = testamonialsList;
  }

  private handleProductError() {
    this.error$.subscribe(error => {
      if (error) {
        this.router.navigate([PublicAppRoutes.PRODUCTS]);
        console.log('Product load error, routing to blog');
      }
    });
  }

  ngOnDestroy() {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }

    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }

    this.analyticsService.closeNavStamp();
  }

}
