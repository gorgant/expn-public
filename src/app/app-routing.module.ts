import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./content/modules/content.module').then(m => m.ContentModule)
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
    scrollPositionRestoration: 'top',
    initialNavigation: 'enabled',
    relativeLinkResolution: 'legacy'
}
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
