import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../components/home/modules/home.module').then(m => m.HomeModule)
  },
  {
    path: 'about',
    loadChildren: () => import('../components/about/modules/about.module').then(m => m.AboutModule)
  },
  {
    path: 'products',
    loadChildren: () => import('../components/products/modules/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'blog',
    loadChildren: () => import('../components/blog/modules/blog.module').then(m => m.BlogModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('../components/contact/modules/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'legal',
    loadChildren: () => import('../components/legal/modules/legal.module').then(m => m.LegalModule)
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
