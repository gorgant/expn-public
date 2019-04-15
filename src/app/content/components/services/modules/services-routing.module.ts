import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServicesComponent } from '../components/services/services.component';
import { RemoteCoachComponent } from '../components/remote-coach/remote-coach.component';
import { CheckOutComponent } from 'src/app/shared/components/check-out/check-out.component';

const routes: Routes = [
  {
    path: '',
    component: ServicesComponent
  },
  {
    path: 'remote-coach',
    component: RemoteCoachComponent
  },
  {
    path: 'checkout',
    component: CheckOutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
