import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: '../components/home/modules/home.module#HomeModule'
  },
  {
    path: 'about',
    loadChildren: '../components/about/modules/about.module#AboutModule'
  },
  {
    path: 'products',
    loadChildren: '../components/products/modules/products.module#ProductsModule'
  },
  {
    path: 'blog',
    loadChildren: '../components/blog/modules/blog.module#BlogModule'
  },
  {
    path: 'contact',
    loadChildren: '../components/contact/modules/contact.module#ContactModule'
  },
  {
    path: 'legal',
    loadChildren: '../components/legal/modules/legal.module#LegalModule'
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
