import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmationComponent } from '../components/confirmation/confirmation.component';


const routes: Routes = [
  {
    path: ':pubId/:subId',
    component: ConfirmationComponent
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
export class ConfirmationRoutingModule { }
