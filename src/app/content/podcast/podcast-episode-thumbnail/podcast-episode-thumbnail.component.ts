import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { PodcastEpisode, PodcastEpisodeKeys } from '../../../../../shared-models/podcast/podcast-episode.model';
import { HelperService } from '../../../core/services/helpers.service';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PublicAppRoutes } from '../../../../../shared-models/routes-and-paths/app-routes.model';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-podcast-episode-thumbnail',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIcon],
  templateUrl: './podcast-episode-thumbnail.component.html',
  styleUrl: './podcast-episode-thumbnail.component.scss'
})
export class PodcastEpisodeThumbnailComponent {

  $podcastEpisode = input.required<PodcastEpisode>()
  $blogPostId = computed(() => {
    return this.$podcastEpisode()[PodcastEpisodeKeys.BLOG_POST_ID];
  });
  $blogPostUrlHandle = computed(() => {
    return this.$podcastEpisode()[PodcastEpisodeKeys.BLOG_POST_URL_HANDLE];
  });
  $publishedTimestamp = computed(() => {
    return this.$podcastEpisode()[PodcastEpisodeKeys.PUBLISHED_TIMESTAMP] as number | null;
  });

  APP_ROUTES = PublicAppRoutes;

  private helperService = inject(HelperService);
  private router = inject(Router);

  // ngOnInit() {
  // }


  // onNavigateToPost() {
  //   const blogPostId = this.$podcastEpisode()[PodcastEpisodeKeys.BLOG_POST_ID];
  //   const blogPostUrlHandle = this.$podcastEpisode()[PodcastEpisodeKeys.BLOG_POST_URL_HANDLE];
  //   this.router.navigate([PublicAppRoutes.BLOG, blogPostId, blogPostUrlHandle]);
  // }


}
