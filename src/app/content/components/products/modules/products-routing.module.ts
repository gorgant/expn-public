import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { CheckOutComponent } from 'src/app/content/components/products/components/check-out/check-out.component';
import { PurchaseConfirmationComponent } from '../components/purchase-confirmation/purchase-confirmation.component';
import { ProductPageComponent } from '../components/product-page/product-page.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
