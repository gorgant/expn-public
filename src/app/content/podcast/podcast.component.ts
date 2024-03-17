import { Component, inject, signal } from '@angular/core';
import { PodcastHeroComponent } from "./podcast-hero/podcast-hero.component";
import { Store } from '@ngrx/store';
import { UiService } from '../../core/services/ui.service';
import { Router } from '@angular/router';
import { ProcessingSpinnerComponent } from '../../shared/components/processing-spinner/processing-spinner.component';
import { AsyncPipe } from '@angular/common';
import { Observable, switchMap, withLatestFrom, filter, map, catchError, throwError, take, tap, timer } from 'rxjs';
import { FirebaseError } from '@angular/fire/app';
import { PodcastEpisode } from '../../../../shared-models/podcast/podcast-episode.model';
import { AdminAppRoutes, PublicAppRoutes } from '../../../../shared-models/routes-and-paths/app-routes.model';
import { PodcastEpisodeStoreSelectors, PodcastEpisodeStoreActions } from '../../root-store';
import { PODCAST_PATHS, PodcastIds } from '../../../../shared-models/podcast/podcast-vars.model';
import { PodcastCollectionComponent } from "./podcast-collection/podcast-collection.component";
import { GlobalFieldValues, SiteSpecificFieldValues } from '../../../../shared-models/content/string-vals.model';
import { MatButtonModule } from '@angular/material/button';
import { metaTagDefaults } from '../../../../shared-models/meta/metatags.model';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SSR_LOADING_TIMER_DURATION } from '../../../../shared-models/ssr/ssr-loading-timer.model';

@Component({
    selector: 'app-podcast',
    standalone: true,
    templateUrl: './podcast.component.html',
    styleUrl: './podcast.component.scss',
    imports: [PodcastHeroComponent, AsyncPipe, ProcessingSpinnerComponent, PodcastCollectionComponent, MatButtonModule]
})
export class PodcastComponent {

  VIEW_FULL_PODCAST_BUTTON_VALUE = GlobalFieldValues.VIEW_FULL_PODCAST;
  PODCAST_SPOTIFY_URL = PODCAST_PATHS.expn.publicLandingPage;

  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  private store$ = inject(Store);
  private uiService = inject(UiService);

  private $fetchPodcastEpisodesSubmitted = signal(false);
  private allPodcastEpisodesFetched$!: Observable<boolean>;
  private fetchAllPodcastEpisodesError$!: Observable<FirebaseError | Error | null>;
  private fetchAllPodcastEpisodesProcessing$!: Observable<boolean>;

  allPodcastEpisodes$!: Observable<PodcastEpisode[]>;

  ngOnInit(): void {
    this.monitorProcesses();
    this.fetchPodcastEpisodes();
    this.configSeoAndAnalytics();
    if (this.uiService.$isServerPlatform()) {
      timer(SSR_LOADING_TIMER_DURATION + 200).subscribe(() => {
        console.log(`${SSR_LOADING_TIMER_DURATION} millis ssr loading timer completed`);
      });
    }
  }

  private configSeoAndAnalytics() {

    const title = SiteSpecificFieldValues.expnPublic.podcastMetaTitle;
    const description = SiteSpecificFieldValues.expnPublic.podcastMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.PODCAST;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }

  private monitorProcesses() {
    this.allPodcastEpisodesFetched$ = this.store$.select(PodcastEpisodeStoreSelectors.selectAllPodcastEpisodesFetched);
    this.fetchAllPodcastEpisodesError$ = this.store$.select(PodcastEpisodeStoreSelectors.selectFetchAllPodcastEpisodesError);
    this.fetchAllPodcastEpisodesProcessing$ = this.store$.select(PodcastEpisodeStoreSelectors.selectFetchAllPodcastEpisodesProcessing);
  }

  private fetchPodcastEpisodes() {
    this.allPodcastEpisodes$ = this.fetchAllPodcastEpisodesError$
      .pipe(
        switchMap(processingError => {
          if (processingError) {
            console.log('processingError detected, terminating pipe', processingError);
            this.resetComponentState();
            this.navigateToHome();
          }
          const allPodcastEpisodesInStore = this.store$.select(PodcastEpisodeStoreSelectors.selectAllPodcastEpisodesInStore);
          return allPodcastEpisodesInStore;
        }),
        withLatestFrom(this.fetchAllPodcastEpisodesError$, this.allPodcastEpisodesFetched$),
        filter(([podcastEpisodes, processingError, allFetched]) => !processingError),
        map(([podcastEpisodes, processingError, allFetched]) => {
          if (!allFetched && !this.$fetchPodcastEpisodesSubmitted()) {
            this.$fetchPodcastEpisodesSubmitted.set(true);
            const podcastContainerId = PodcastIds.EXPN_RSS_FEED_ID;
            this.store$.dispatch(PodcastEpisodeStoreActions.fetchAllPodcastEpisodesRequested({podcastContainerId}));
          }
          console.log('podcastEpisodes loaded into component', podcastEpisodes.length);
          return podcastEpisodes;
        }),
        filter(podcastEpisodes => podcastEpisodes.length > 0),
        // Catch any local errors
        catchError(error => {
          console.log('Error in component:', error);
          this.uiService.showSnackBar(`Something went wrong. Please try again.`, 7000);
          this.resetComponentState();
          this.navigateToHome();
          return throwError(() => new Error(error));
        })
      )
  }

  private resetComponentState() {
    this.$fetchPodcastEpisodesSubmitted.set(false);
    this.store$.dispatch(PodcastEpisodeStoreActions.purgePodcastEpisodeStateErrors());
  }

  private navigateToHome() {
    this.router.navigate([AdminAppRoutes.HOME]);
  }

  ngOnDestroy(): void {
    this.fetchAllPodcastEpisodesError$
      .pipe(
        take(1),
        tap(error => {
          if (error) {
            this.store$.dispatch(PodcastEpisodeStoreActions.purgePodcastEpisodeStateErrors());
          }
        })
      ).subscribe();
  }

}
