import { NgModule } from '@angular/core';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from '../components/about/about.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AboutBodyComponent } from '../components/about-body/about-body.component';

@NgModule({
  declarations: [
    AboutComponent,
    AboutBodyComponent
  ],
  imports: [
    SharedModule,
    AboutRoutingModule
  ]
})
export class AboutModule { }
