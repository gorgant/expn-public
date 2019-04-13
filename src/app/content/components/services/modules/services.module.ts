import { NgModule } from '@angular/core';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from '../components/services/services.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RemoteCoachComponent } from '../components/remote-coach/remote-coach.component';

@NgModule({
  declarations: [
    ServicesComponent,
    RemoteCoachComponent
  ],
  imports: [
    SharedModule,
    ServicesRoutingModule
  ]
})
export class ServicesModule { }
