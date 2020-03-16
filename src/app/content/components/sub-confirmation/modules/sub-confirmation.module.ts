import { NgModule } from '@angular/core';

import { SubConfirmationRoutingModule } from './sub-confirmation-routing.module';
import { SubConfirmationComponent } from '../components/sub-confirmation/sub-confirmation.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    SubConfirmationComponent
  ],
  imports: [
    SharedModule,
    SubConfirmationRoutingModule
  ]
})
export class SubConfirmationModule { }
