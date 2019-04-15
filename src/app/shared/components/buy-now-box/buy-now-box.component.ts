import { Component, OnInit, Input } from '@angular/core';
import { BuyNowBoxData } from 'src/app/core/models/forms-and-components/buy-now-box-data.model';
import { IconPaths } from 'src/app/core/models/routes-and-paths/icon-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreActions } from 'src/app/root-store';
import { ProductData } from 'src/app/core/models/products/product-data.model';
import { Router } from '@angular/router';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-buy-now-box',
  templateUrl: './buy-now-box.component.html',
  styleUrls: ['./buy-now-box.component.scss']
})
export class BuyNowBoxComponent implements OnInit {

  @Input() buyNowData: BuyNowBoxData;
  @Input() productData: ProductData;

  iconPaths = IconPaths;

  title: string;
  subtitle: string;
  buttonText: string;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router
  ) { }

  ngOnInit() {

    this.initializeInputData();
    console.log('Buy now initialized with this product data', this.productData);
  }

  onBuyNow() {
    this.store$.dispatch(new UserStoreActions.SetProductData({productData: this.productData}));
    this.router.navigate([AppRoutes.CHECKOUT]);
  }

  private initializeInputData() {
    this.title = this.buyNowData.title;
    this.subtitle = this.buyNowData.subtitle;
    this.buttonText = this.buyNowData.buttonText;
  }

}
