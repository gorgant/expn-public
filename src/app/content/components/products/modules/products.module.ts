import { NgModule } from '@angular/core';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RemoteCoachComponent } from '../components/remote-coach/remote-coach.component';
import { RcProductDiagramComponent } from '../components/remote-coach/rc-product-diagram/rc-product-diagram.component';
import { PurchaseConfirmationComponent } from '../components/purchase-confirmation/purchase-confirmation.component';
import { BuyNowBoxComponent } from '../components/buy-now-box/buy-now-box.component';
import { CheckOutComponent } from '../components/check-out/check-out.component';
import { PurchaseDataFormComponent } from '../components/check-out/purchase-data-form/purchase-data-form.component';
import { ProductSummaryComponent } from '../components/check-out/product-summary/product-summary.component';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { ProductPageComponent } from '../components/product-page/product-page.component';
import { StripeElementsComponent } from '../components/check-out/stripe-elements/stripe-elements.component';
import { CouponFormComponent } from '../components/check-out/coupon-form/coupon-form.component';

@NgModule({
  declarations: [
    ProductListComponent,
    RemoteCoachComponent,
    RcProductDiagramComponent,
    PurchaseConfirmationComponent,
    BuyNowBoxComponent,
    CheckOutComponent,
    ProductSummaryComponent,
    PurchaseDataFormComponent,
    ProductCardComponent,
    ProductPageComponent,
    StripeElementsComponent,
    CouponFormComponent,
  ],
  imports: [
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
