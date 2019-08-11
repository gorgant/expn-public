import { NgModule } from '@angular/core';

import { PodcastRoutingModule } from './podcast-routing.module';
import { PodcastComponent } from '../components/podcast/podcast.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PodcastBodyComponent } from '../components/podcast-body/podcast-body.component';
import { EpisodeItemComponent } from '../components/episode-item/episode-item.component';


@NgModule({
  declarations: [
    PodcastComponent,
    PodcastBodyComponent,
    EpisodeItemComponent
  ],
  imports: [
    SharedModule,
    PodcastRoutingModule
  ]
})
export class PodcastModule { }
