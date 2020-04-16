import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckOutComponent } from 'src/app/content/components/products/components/check-out/check-out.component';
import { PurchaseConfirmationComponent } from '../components/purchase-confirmation/purchase-confirmation.component';
import { ProductPageComponent } from '../components/product-page/product-page.component';
import { ServiceListComponent } from '../components/service-list/service-list.component';
import { WebcourseListComponent } from '../components/webcourse-list/webcourse-list.component';

const routes: Routes = [
  {
    path: 'services',
    component: ServiceListComponent
  },
  {
    path: 'webcourses',
    component: WebcourseListComponent
  },
  {
    path: ':id/:productName',
    component: ProductPageComponent
  },
  {
    path: 'checkout',
    component: CheckOutComponent
  },
  {
    path: 'purchase-confirmation',
    component: PurchaseConfirmationComponent
  },
  {
    path: '',
    redirectTo: 'webcourses',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
