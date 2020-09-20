import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { catchError, takeUntil, map, take, tap } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';
import { PodcastEpisode, PodcastEpisodeKeys } from 'shared-models/podcast/podcast-episode.model';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';
import { SharedCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { TransferStateKeys } from 'shared-models/ssr/ssr-vars';
import { PodcastVars } from 'shared-models/podcast/podcast-vars.model';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {

  private podcastEpisodeQueryField = PodcastEpisodeKeys.PUB_DATE;
  private podcastEpisodeQueryLimit = PodcastVars.PODCAST_QUERY_LIMIT;

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private uiService: UiService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  fetchPodcastContainer(podcastId) {
    const podcastDoc = this.getPodcastContainerDoc(podcastId);
    return podcastDoc.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(podcast => {
          console.log('Fetched podcast container');
          return podcast;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  fetchAllPodcastEpisodes(podcastId: string): Observable<PodcastEpisode[]> {

    const PODCAST_EPISODES_KEY = makeStateKey<PodcastEpisode[]>(TransferStateKeys.ALL_PODCAST_EPISODES_KEY);

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(PODCAST_EPISODES_KEY)) {
      console.log('Fetching episodes from transfer state');
      const cacheData = this.transferState.get<PodcastEpisode[]>(PODCAST_EPISODES_KEY, {} as any);
      cacheData.sort((a, b) => (b.pubDate > a.pubDate) ? 1 : ((a.pubDate > b.pubDate) ? -1 : 0));
      this.transferState.remove(PODCAST_EPISODES_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const episodeCollection = this.getEpisodesCollection(podcastId);
    return episodeCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(episodes => {
          console.log(`Fetched all ${episodes.length} episodes`, episodes);
          return episodes;
        }),
        tap(episodes => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PODCAST_EPISODES_KEY, episodes); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  fetchSinglePodcastEpisode(podcastId: string, episodeId: string): Observable<PodcastEpisode> {

    const SINGLE_EPISODE_KEY = makeStateKey<PodcastEpisode>(`${episodeId}-${TransferStateKeys.SINGLE_PODCAST_EPISODE_KEY}`);

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(SINGLE_EPISODE_KEY)) {
      console.log('Fetching single episode from transfer state');
      const cacheData = this.transferState.get<PodcastEpisode>(SINGLE_EPISODE_KEY, {} as any);
      this.transferState.remove(SINGLE_EPISODE_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const episodeDoc = this.getEpisodeDoc(podcastId, episodeId);
    return episodeDoc.valueChanges()
      .pipe(
        take(1),
        map(episode => {
          console.log('Fetched single episode');
          return episode;
        }),
        tap(episode => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SINGLE_EPISODE_KEY, episode); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  private getPodcastContainerCollection(): AngularFirestoreCollection<PodcastEpisode> {
    return this.afs.collection<PodcastEpisode>(SharedCollectionPaths.PODCAST_FEED_CACHE);
  }

  private getPodcastContainerDoc(podcastId: string): AngularFirestoreDocument<PodcastEpisode> {
    return this.getPodcastContainerCollection().doc<PodcastEpisode>(podcastId);
  }

  private getEpisodesCollection(podcastId: string): AngularFirestoreCollection<PodcastEpisode> {
    return this.getPodcastContainerDoc(podcastId).collection<PodcastEpisode>(
      SharedCollectionPaths.PODCAST_FEED_EPISODES, ref => ref
        .orderBy(this.podcastEpisodeQueryField, 'desc') // Ensures most recent podcasts come first
        .limit(this.podcastEpisodeQueryLimit) // Limit results to most recent for faster page load
    );
  }

  private getEpisodeDoc(podcastId: string, episodeId: string): AngularFirestoreDocument<PodcastEpisode> {
    return this.getEpisodesCollection(podcastId).doc<PodcastEpisode>(episodeId);
  }

}



