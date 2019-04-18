import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { ProductData } from 'src/app/core/models/products/product-data.model';

@Component({
  selector: 'app-purchase-confirmation',
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.scss']
})
export class PurchaseConfirmationComponent implements OnInit {

  productData$: Observable<ProductData>;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializeProductData();
  }

  private initializeProductData() {
    this.productData$ = this.store$.select(
      UserStoreSelectors.selectProductData
    );
  }

}
