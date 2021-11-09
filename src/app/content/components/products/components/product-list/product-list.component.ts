import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootStoreState } from 'src/app/root-store';
import { ProductStoreSelectors, ProductStoreActions } from 'src/app/root-store/product-store';
import { withLatestFrom, map, filter, tap } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { Product } from 'shared-models/products/product.model';
import { metaTagDefaults, metaTagsContentPages } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  products$: Observable<Product[]>;

  intervalId: NodeJS.Timer;
  intervalCount = 0;
  
  constructor(
    private store$: Store<RootStoreState.State>,

    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
    this.initializeProducts();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    this.intervalId = setInterval(() => {
      console.log('Interval running')
      this.intervalCount++;
      if (this.intervalCount > 20) {
        console.log('Clearing interval, exceeded cap');
        clearInterval(this.intervalId);
      }
    }, 100); // A janky SSR work-around to ensure post loads before Universal renders the post, consider removing

    const title = metaTagsContentPages.expnPublic.productListMetaTitle;
    // tslint:disable-next-line:max-line-length
    const description = metaTagsContentPages.expnPublic.productListMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.PRODUCTS;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  private initializeProducts() {
    this.products$ = this.store$.select(ProductStoreSelectors.selectAllProducts)
      .pipe(
        withLatestFrom(
          this.store$.select(ProductStoreSelectors.selectProductsLoaded)
        ),
        map(([products, productsLoaded]) => {
          // Check if items are loaded, if not fetch from server
          if (!productsLoaded) {
            console.log('No products loaded, loading those now');
            this.store$.dispatch(new ProductStoreActions.AllProductsRequested());
          }
          return products;
        }),
        filter(products => products.length > 0), // Catches the first emission which is an empty array
        tap(products => clearInterval(this.intervalId))
      );
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
    clearInterval(this.intervalId);
  }

}
