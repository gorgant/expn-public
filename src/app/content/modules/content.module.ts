import { NgModule } from '@angular/core';

import { ContentRoutingModule } from './content-routing.module';
import { HomeComponent } from '../components/home/home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AboutComponent } from '../components/about/about.component';
import { ServicesComponent } from '../components/services/services.component';
import { BlogComponent } from '../components/blog/blog.component';
import { PodcastComponent } from '../components/podcast/podcast.component';
import { ContactComponent } from '../components/contact/contact.component';

@NgModule({
  declarations: [HomeComponent, AboutComponent, ServicesComponent, BlogComponent, PodcastComponent, ContactComponent],
  imports: [
    SharedModule,
    ContentRoutingModule
  ]
})
export class ContentModule { }
