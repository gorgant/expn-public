import { Component, OnInit } from '@angular/core';
import { PodcastService } from 'src/app/core/services/podcast.service';
import { Observable } from 'rxjs';
import { PodcastEpisode } from 'shared-models/podcast/podcast-episode.model';
import { PodcastPaths } from 'shared-models/podcast/podcast-paths.model';
import { UiService } from 'src/app/core/services/ui.service';

@Component({
  selector: 'app-podcast-body',
  templateUrl: './podcast-body.component.html',
  styleUrls: ['./podcast-body.component.scss']
})
export class PodcastBodyComponent implements OnInit {

  podcastList$: Observable<PodcastEpisode[]>;

  constructor(
    private podcastService: PodcastService,
    private uiService: UiService
  ) { }

  ngOnInit() {
    const podcastId = PodcastPaths.EXPLEARNING_RSS_FEED.split('users:')[1].split('/')[0]; // May change if RSS feed link changes
    this.podcastList$ = this.podcastService.fetchAllPodcastEpisodes(podcastId);
  }

  onGetPodcastFeed() {

  }

}
