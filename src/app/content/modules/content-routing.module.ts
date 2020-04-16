import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

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
    path: 'services',
    loadChildren: () => import('../components/products/modules/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'webcourses',
    loadChildren: () => import('../components/products/modules/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'blog',
    loadChildren: () => import('../components/blog/modules/blog.module').then(m => m.BlogModule)
  },
  {
    path: 'podcast',
    loadChildren: () => import('../components/podcast/modules/podcast.module').then(m => m.PodcastModule)
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
    path: 'sub-confirmation',
    loadChildren: () => import('../components/sub-confirmation/modules/sub-confirmation.module').then(m => m.SubConfirmationModule)
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
