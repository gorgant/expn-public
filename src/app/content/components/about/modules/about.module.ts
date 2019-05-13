import { NgModule } from '@angular/core';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from '../components/about/about.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    SharedModule,
    AboutRoutingModule
  ]
})
export class AboutModule { }
