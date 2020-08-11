import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootStoreState } from 'src/app/root-store';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductStoreSelectors, ProductStoreActions } from 'src/app/root-store/product-store';
import { withLatestFrom, map } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { Product } from 'shared-models/products/product.model';
import { ProductIdList } from 'shared-models/products/product-id-list.model';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { BuyNowBoxData } from 'shared-models/products/buy-now-box-data.model';
import { TestamonialData } from 'shared-models/forms-and-components/testamonial-data.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { testamonialsList } from 'shared-models/forms-and-components/testamonials.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { UiService } from 'src/app/core/services/ui.service';

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
  loadProductTriggered: boolean;
  private titleSet: boolean;
  productSubscription: Subscription;

  productIdList = ProductIdList;

  heroData: PageHeroData;
  buyNowData: BuyNowBoxData;
  testamonialData: TestamonialData[];
  imagePaths = PublicImagePaths;

  showBuyNowBox: boolean;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private router: Router,
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.initializeProductData();
    this.handleProductError();
    this.initializePageComponents();
  }

  private configSeoAndAnalytics(product: Product) {

    const title = `${product.name} - ${metaTagDefaults.explearningPublic.metaTagSiteName}`;
    const description = `${product.tagline} ${product.productCardData.highlights.join('. ')}.`;
    const localImagePath = this.heroData.imageProps.src;
    const productSlug = this.uiService.convertToFriendlyUrlFormat(product.name);
    const canonicalUrlPath = `${PublicAppRoutes.PRODUCTS}/${product.id}/${productSlug}`;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  private initializeProductData() {
    // Check if id params are available
    const idParamName = 'id';
    const idParam = this.route.snapshot.params[idParamName];
    if (!idParam) {
      console.log('Error No product data found in url');
      return;
    }
    this.productId = idParam.toLowerCase(); // Remove any possible erroneous lowercasing (IDs are specifically set to lower case in admin)
    this.getProduct();
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
          if (!productsLoaded && !this.loadProductTriggered) {
            console.log('No products in store, fetching from server', this.productId);
            this.loadProductTriggered = true; // Prevents loading from firing more than needed
            this.store$.dispatch(new ProductStoreActions.SingleProductRequested({productId: this.productId}));
          }
          this.loadProductTriggered = true; // Prevents loading from firing more than needed
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
        // this.initializeBuyNowData(product);
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
