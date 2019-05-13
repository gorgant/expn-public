import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from '../components/home/home.component';
import { InActionComponent } from '../components/in-action/in-action.component';
import { FeatureIconsComponent } from '../components/feature-icons/feature-icons.component';

@NgModule({
  declarations: [
    HomeComponent,
    InActionComponent,
    FeatureIconsComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
