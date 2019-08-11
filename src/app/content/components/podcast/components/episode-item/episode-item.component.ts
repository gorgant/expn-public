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

  blogPostHandle: string;

  appRoutes = PublicAppRoutes;

  constructor(
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.blogPostHandle = this.uiService.convertToFriendlyUrlFormat(this.episode.title);
  }

  // TODO: When user clicks on a podcast, expand to show the webplayer using ngIf
  // OR: have it route to the blog (would need to put episode GUID into blog post)

}
