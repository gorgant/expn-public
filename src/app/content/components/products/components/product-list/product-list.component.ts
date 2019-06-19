import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootStoreState } from 'src/app/root-store';
import { ProductStoreSelectors, ProductStoreActions } from 'src/app/root-store/product-store';
import { withLatestFrom, map } from 'rxjs/operators';
import { Product } from 'src/app/core/models/products/product.model';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';

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

    const title = `Explearning - Services`;
    // tslint:disable-next-line:max-line-length
    const description = `Explearning offers a variety of services to help you improve your speaking skills and communication skills. From professional communications coaching to high quality web courses, our goal is to make you the best communicator you can be.`;
    const image = PublicImagePaths.HOME;

    this.analyticsService.setSeoTags(title, description, image);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
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
