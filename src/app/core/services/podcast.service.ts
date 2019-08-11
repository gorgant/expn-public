import { Injectable } from '@angular/core';
import { catchError, takeUntil, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { PodcastEpisode } from 'shared-models/podcast/podcast-episode.model';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';
import { PublicCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private uiService: UiService,
  ) { }

  fetchPodcastContainer(podcastId) {
    const podcastDoc = this.getPodcastContainerDoc(podcastId);
    return podcastDoc.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(podcast => {
          console.log('Fetched this podcast', podcast);
          return podcast;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchAllPodcastEpisodes(podcastId: string): Observable<PodcastEpisode[]> {
    const episodeCollection = this.getEpisodesCollection(podcastId);
    return episodeCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(episodes => {
          console.log('Fetched all episodes', episodes);
          return episodes;
        }),
        catchError(error => {
          console.log('Error getting episodes', error);
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchSinglePodcastEpisode(podcastId: string, episodeId: string): Observable<PodcastEpisode> {
    const episodeDoc = this.getEpisodeDoc(podcastId, episodeId);
    return episodeDoc.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(episode => {
          console.log('Fetched this episode', episode);
          return episode;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  private getPodcastContainerCollection(): AngularFirestoreCollection<PodcastEpisode> {
    return this.afs.collection<PodcastEpisode>(PublicCollectionPaths.PODCAST_FEED_CACHE);
  }

  private getPodcastContainerDoc(podcastId: string): AngularFirestoreDocument<PodcastEpisode> {
    return this.getPodcastContainerCollection().doc<PodcastEpisode>(podcastId);
  }

  private getEpisodesCollection(podcastId: string): AngularFirestoreCollection<PodcastEpisode> {
    return this.getPodcastContainerDoc(podcastId).collection<PodcastEpisode>(PublicCollectionPaths.PODCAST_FEED_EPISODES);
  }

  private getEpisodeDoc(podcastId: string, episodeId: string): AngularFirestoreDocument<PodcastEpisode> {
    return this.getEpisodesCollection(podcastId).doc<PodcastEpisode>(episodeId);
  }

}



