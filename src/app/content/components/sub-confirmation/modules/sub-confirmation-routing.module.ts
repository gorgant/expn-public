import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubConfirmationComponent } from '../components/sub-confirmation/sub-confirmation.component';


const routes: Routes = [
  {
    path: ':pubId/:subId',
    component: SubConfirmationComponent
  },
  {
    path: '', // If no ID, redirect to home page
    redirectTo: '/',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubConfirmationRoutingModule { }
