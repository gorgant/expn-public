import { Component, OnInit } from '@angular/core';
import { PodcastService } from 'src/app/core/services/podcast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-podcast-body',
  templateUrl: './podcast-body.component.html',
  styleUrls: ['./podcast-body.component.scss']
})
export class PodcastBodyComponent implements OnInit {

  podcastList$: Observable<{}>;

  constructor(
    private podcastService: PodcastService
  ) { }

  ngOnInit() {
    // this.podcastList$ = this.podcastService.fetchPodcastList();
  }

  onGetPodcastFeed() {
    this.podcastService.fetchPodcastFeed();
    // this.podcastService.getPodcastFeed();
  }

}
