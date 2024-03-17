import { Injectable, TransferState, inject, makeStateKey } from '@angular/core';
import { CollectionReference, DocumentReference, Firestore, Query, Timestamp, collection, collectionData, doc, docData, limit, orderBy, query } from '@angular/fire/firestore';
import { UiService } from './ui.service';
import { PodcastEpisode, PodcastEpisodeKeys } from '../../../../shared-models/podcast/podcast-episode.model';
import { SharedCollectionPaths } from '../../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { Observable, catchError, map, of, shareReplay, throwError } from 'rxjs';
import { PodcastVars } from '../../../../shared-models/podcast/podcast-vars.model';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {

  private firestore = inject(Firestore);
  private transferState = inject(TransferState);
  private uiService = inject(UiService);

  constructor() { }

  fetchAllPodcastEpisodes(podcastContainerId: string) {
    const ALL_PODCAST_EPISODES_KEY = makeStateKey<PodcastEpisode[]>('allPodcastEpisodes -' + podcastContainerId);
    if (this.transferState.hasKey(ALL_PODCAST_EPISODES_KEY)) {
      const cachedPodcastEpisodes = this.transferState.get<PodcastEpisode[] | null>(ALL_PODCAST_EPISODES_KEY, null);
      this.transferState.remove(ALL_PODCAST_EPISODES_KEY); // Clean up cache
      if (cachedPodcastEpisodes && cachedPodcastEpisodes.length > 20) {
        console.log(`${cachedPodcastEpisodes.length} podcastEpisodes found in transferState with this key`, ALL_PODCAST_EPISODES_KEY);
        return of(cachedPodcastEpisodes!);
      }
    }

    const podcastEpisodeCollectionRef = this.getPodcastEpisodeCollectionByDate(podcastContainerId);
    const podcastEpisodeCollectionDataRequest = collectionData(podcastEpisodeCollectionRef) as Observable<PodcastEpisode[]>;

    return podcastEpisodeCollectionDataRequest
      .pipe(
        map(podcastEpisodes => {
          if (!podcastEpisodes) {
            throw new Error(`Error fetching podcastEpisodes`);
          }
          const podcastEpisodesWithUpdatedTimestamps = podcastEpisodes.map(podcastEpisode => {
            const formattedPodcastEpisodes: PodcastEpisode = {
              ...podcastEpisode,
              [PodcastEpisodeKeys.PUBLISHED_TIMESTAMP]: (podcastEpisode[PodcastEpisodeKeys.PUBLISHED_TIMESTAMP] as Timestamp).toMillis(),
              [PodcastEpisodeKeys.LAST_MODIFIED_TIMESTAMP]: (podcastEpisode[PodcastEpisodeKeys.LAST_MODIFIED_TIMESTAMP] as Timestamp).toMillis(),
            };
            return formattedPodcastEpisodes;
          });
          console.log(`Fetched all ${podcastEpisodesWithUpdatedTimestamps.length} podcastEpisodes`);
          if (this.uiService.$isServerPlatform()) {
            console.log('Setting allPodcastEpisodes in transferState');
            this.transferState.set(ALL_PODCAST_EPISODES_KEY, podcastEpisodesWithUpdatedTimestamps);
          }
          return podcastEpisodesWithUpdatedTimestamps;
        }),
        shareReplay(),
        catchError(error => {
          this.uiService.showSnackBar(error.message, 10000);
          console.log('Error fetching podcastEpisodes', error);
          return throwError(() => new Error(error));
        })
      );
  }

  fetchSinglePodcastEpisode(podcastContainerId: string, podcastEpisodeId: string): Observable<PodcastEpisode> {
    const PODCAST_EPISODE_KEY = makeStateKey<PodcastEpisode>('podcastEpisode -' + podcastEpisodeId);
    if (this.transferState.hasKey(PODCAST_EPISODE_KEY)) {
      console.log('podcastEpisode found in transferState with this key', PODCAST_EPISODE_KEY);
      const cachedPodcastEpisode = this.transferState.get<PodcastEpisode | null>(PODCAST_EPISODE_KEY, null);
      this.transferState.remove(PODCAST_EPISODE_KEY); // Clean up cache
      return of(cachedPodcastEpisode!);
    } 

    const podcastEpisodeRef = this.getPodcastEpisodeDoc(podcastContainerId, podcastEpisodeId);
    const podcastEpisode = docData(podcastEpisodeRef);

    return podcastEpisode
      .pipe(
        // If logged out, this triggers unsub of this observable
        map(podcastEpisode => {
          if (!podcastEpisode) {
            throw new Error(`Error fetching podcastEpisode with id: ${podcastContainerId}`);
          }
          const formattedPodcastEpisode: PodcastEpisode = {
            ...podcastEpisode,
            [PodcastEpisodeKeys.PUBLISHED_TIMESTAMP]: (podcastEpisode[PodcastEpisodeKeys.PUBLISHED_TIMESTAMP] as Timestamp).toMillis(),
            [PodcastEpisodeKeys.LAST_MODIFIED_TIMESTAMP]: (podcastEpisode[PodcastEpisodeKeys.LAST_MODIFIED_TIMESTAMP] as Timestamp).toMillis(),
          };
          console.log(`Fetched single podcastEpisode`, formattedPodcastEpisode);
          if (this.uiService.$isServerPlatform()) {
            console.log('Setting podcastEpisode in transferState');
            this.transferState.set(PODCAST_EPISODE_KEY, podcastEpisode);
          }
          return formattedPodcastEpisode;
        }),
        shareReplay(),
        catchError(error => {
          this.uiService.showSnackBar(error.message, 10000);
          console.log(`Error fetching podcastEpisode`, error);
          return throwError(() => new Error(error));
        })
      );
  }

  private getPodcastEpisodeCollection(podcastContainerId: string): CollectionReference<PodcastEpisode> {
    return collection(this.firestore, `${SharedCollectionPaths.PODCAST_CONTAINERS}/${podcastContainerId}/${SharedCollectionPaths.PODCAST_EPISODES}`) as CollectionReference<PodcastEpisode>;
  }

  private getPodcastEpisodeCollectionByDate(podcastContainerId: string): Query<PodcastEpisode> {
    const podcastEpisodeCollectionRef = collection(this.firestore, `${SharedCollectionPaths.PODCAST_CONTAINERS}/${podcastContainerId}/${SharedCollectionPaths.PODCAST_EPISODES}`) as CollectionReference<PodcastEpisode>;
    const collectionRefOrderedByIndex = query(podcastEpisodeCollectionRef, orderBy(PodcastEpisodeKeys.PUBLISHED_TIMESTAMP, 'desc'), limit(+PodcastVars.PODCAST_QUERY_LIMIT));
    return collectionRefOrderedByIndex;
  }

  private getPodcastEpisodeDoc(podcastContainerId: string, podcastEpisodeId: string): DocumentReference<PodcastEpisode> {
    return doc(this.getPodcastEpisodeCollection(podcastContainerId), podcastEpisodeId);
  }

}
