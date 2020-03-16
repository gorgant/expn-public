import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Product } from 'shared-models/products/product.model';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors } from 'src/app/root-store';
import { Observable, Subscription } from 'rxjs';
import { DiscountCouponChild } from 'shared-models/billing/discount-coupon.model';
import { UiService } from 'src/app/core/services/ui.service';

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.scss']
})
export class ProductSummaryComponent implements OnInit, OnDestroy {

  @Input() product: Product;

  discountCoupon$: Observable<DiscountCouponChild>;
  discountCouponSubscription: Subscription;
  discountedPrice: number;

  constructor(
    private store$: Store<RootStoreState.State>,
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.monitorCouponStatus();
  }

  private monitorCouponStatus() {
    this.discountCoupon$ = this.store$.select(BillingStoreSelectors.selectDiscountCoupon);

    this.discountCouponSubscription = this.discountCoupon$.subscribe(coupon => {
      if (coupon && coupon.valid) {
        const discountedPrice = this.product.price * (1 - coupon.discountPercentage);
        this.discountedPrice = this.uiService.generateRoundedNumber(discountedPrice, 2);
        // this.discountedPrice = discountedPrice;
      } else {
        this.discountedPrice = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.discountCouponSubscription) {
      this.discountCouponSubscription.unsubscribe();
    }
  }

}
