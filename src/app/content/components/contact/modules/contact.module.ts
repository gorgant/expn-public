import { NgModule } from '@angular/core';

import { ContactRoutingModule } from './contact-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContactComponent } from '../components/contact/contact.component';
import { ContactBodyComponent } from '../components/contact-body/contact-body.component';

@NgModule({
  declarations: [
    ContactComponent,
    ContactBodyComponent
  ],
  imports: [
    SharedModule,
    ContactRoutingModule
  ]
})
export class ContactModule { }
