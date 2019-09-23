import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootStoreState } from 'src/app/root-store';
import { ProductStoreSelectors, ProductStoreActions } from 'src/app/root-store/product-store';
import { withLatestFrom, map } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { Product } from 'shared-models/products/product.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  products$: Observable<Product[]>;

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

    const title = `Services - ${metaTagDefaults.explearningPublic.metaTagSiteName}`;
    // tslint:disable-next-line:max-line-length
    const description = `${metaTagDefaults.explearningPublic.metaTagSiteName} offers a variety of services to help you improve your speaking skills and communication skills. From professional communications coaching to high quality web courses, our goal is to make you the best communicator you can be.`;
    const localImagePath = metaTagDefaults.explearningPublic.metaTagDefaultImage;
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
          this.store$.dispatch(new ProductStoreActions.AllProductsRequested());
        }
        return products;
      })
    );
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
