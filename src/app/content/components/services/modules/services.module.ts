import { NgModule } from '@angular/core';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from '../components/services/services.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RemoteCoachComponent } from '../components/remote-coach/remote-coach.component';
import { RcProductDiagramComponent } from '../components/remote-coach/rc-product-diagram/rc-product-diagram.component';

@NgModule({
  declarations: [
    ServicesComponent,
    RemoteCoachComponent,
    RcProductDiagramComponent
  ],
  imports: [
    SharedModule,
    ServicesRoutingModule
  ]
})
export class ServicesModule { }
