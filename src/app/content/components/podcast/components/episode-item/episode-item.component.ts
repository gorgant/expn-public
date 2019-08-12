import { Component, OnInit, Input } from '@angular/core';
import { PodcastEpisode } from 'shared-models/podcast/podcast-episode.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { UiService } from 'src/app/core/services/ui.service';

@Component({
  selector: 'app-episode-item',
  templateUrl: './episode-item.component.html',
  styleUrls: ['./episode-item.component.scss']
})
export class EpisodeItemComponent implements OnInit {

  @Input() episode: PodcastEpisode;

  appRoutes = PublicAppRoutes;

  constructor( ) { }

  ngOnInit() {
  }

}
