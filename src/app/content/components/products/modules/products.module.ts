import { NgModule } from '@angular/core';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RemoteCoachComponent } from '../components/services/remote-coach/remote-coach.component';
import { RcProductDiagramComponent } from '../components/services/remote-coach/rc-product-diagram/rc-product-diagram.component';
import { PurchaseConfirmationComponent } from '../components/purchase-confirmation/purchase-confirmation.component';
import { BuyNowBoxComponent } from '../components/buy-now-box/buy-now-box.component';
import { CheckOutComponent } from '../components/check-out/check-out.component';
import { PurchaseDataFormComponent } from '../components/check-out/purchase-data-form/purchase-data-form.component';
import { ProductSummaryComponent } from '../components/check-out/product-summary/product-summary.component';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { ProductPageComponent } from '../components/product-page/product-page.component';
import { StripeElementsComponent } from '../components/check-out/stripe-elements/stripe-elements.component';
import { CouponFormComponent } from '../components/check-out/coupon-form/coupon-form.component';
import { WebcourseListComponent } from '../components/webcourse-list/webcourse-list.component';
import { ServiceListComponent } from '../components/service-list/service-list.component';
import { ExecutivePresenceComponent } from '../components/webcourses/executive-presence/executive-presence.component';
import { RemoteWorkComponent } from '../components/webcourses/remote-work/remote-work.component';
import { OnlineInterviewsComponent } from '../components/webcourses/online-interviews/online-interviews.component';
import { GroupInterviewsComponent } from '../components/webcourses/group-interviews/group-interviews.component';

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
    WebcourseListComponent,
    ServiceListComponent,
    ExecutivePresenceComponent,
    RemoteWorkComponent,
    OnlineInterviewsComponent,
    GroupInterviewsComponent,
  ],
  imports: [
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
