import { NgModule } from '@angular/core';

import { ContentRoutingModule } from './content-routing.module';
import { HomeComponent } from '../components/home/home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AboutComponent } from '../components/about/about.component';
import { ServicesComponent } from '../components/services/services.component';
import { PodcastComponent } from '../components/podcast/podcast.component';
import { ContactComponent } from '../components/contact/contact.component';
import { HeroComponent } from '../components/home/hero/hero.component';
import { FeatureIconsComponent } from '../components/home/feature-icons/feature-icons.component';
import { InActionComponent } from '../components/home/in-action/in-action.component';

@NgModule({
  declarations: [
    HomeComponent,
    AboutComponent,
    ServicesComponent,
    PodcastComponent,
    ContactComponent,
    HeroComponent,
    FeatureIconsComponent,
    InActionComponent
  ],
  imports: [
    SharedModule,
    ContentRoutingModule
  ]
})
export class ContentModule { }
