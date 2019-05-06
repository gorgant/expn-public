import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { Product } from 'src/app/core/models/products/product.model';
import * as StripeDefs from 'stripe';
import { ProductStoreSelectors, ProductStoreActions } from 'src/app/root-store/product-store';
import { take, withLatestFrom, map } from 'rxjs/operators';

@Component({
  selector: 'app-purchase-confirmation',
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.scss']
})
export class PurchaseConfirmationComponent implements OnInit {

  purchaseData$: Observable<StripeDefs.charges.ICharge>;
  // productData$: Observable<Product>;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializePurchaseData();
  }

  private initializePurchaseData() {
    // Load purchase data from store
    this.purchaseData$ = this.store$.select(
      BillingStoreSelectors.selectStripeCharge
    ) as Observable<StripeDefs.charges.ICharge>;

    // // Use purchase data to fetch product from store
    // this.purchaseData$
    //   .pipe(take(1))
    //   .subscribe(purchaseData => {
    //     if (purchaseData) {
    //       console.log('Purchase data fetched', purchaseData);
    //       this.getProductData(purchaseData.metadata.productId);
    //     }
    //   });
  }

  // private getProductData(productId: string) {
  //   this.productData$ = this.store$.select(ProductStoreSelectors.selectProductById(productId))
  //     .pipe(
  //       withLatestFrom(
  //         this.store$.select(ProductStoreSelectors.selectProductsLoaded)
  //       ),
  //       map(([productData, productsLoaded]) => {
  //         if (!productsLoaded) {
  //           this.store$.dispatch(new ProductStoreActions.AllProductsRequested());
  //         }
  //         return productData;
  //       })
  //     );
  // }

}
