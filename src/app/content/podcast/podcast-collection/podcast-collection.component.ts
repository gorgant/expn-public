import { Component, input } from '@angular/core';
import { PodcastEpisode } from '../../../../../shared-models/podcast/podcast-episode.model';
import { PodcastEpisodeThumbnailComponent } from "../podcast-episode-thumbnail/podcast-episode-thumbnail.component";

@Component({
    selector: 'app-podcast-collection',
    standalone: true,
    templateUrl: './podcast-collection.component.html',
    styleUrl: './podcast-collection.component.scss',
    imports: [PodcastEpisodeThumbnailComponent]
})
export class PodcastCollectionComponent {

  $podcastEpisodes = input.required<PodcastEpisode[]>();

}
