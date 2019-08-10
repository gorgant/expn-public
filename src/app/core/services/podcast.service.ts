import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';
import { PublicFunctionNames } from 'shared-models/routes-and-paths/fb-function-names';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {

  constructor(
    private http: HttpClient,
    private fns: AngularFireFunctions,
  ) { }

  // fetchPodcastList(): Observable<{}> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       // 'Content-Type':  'application/rss+xml',
  //       'Access-Control-Allow-Origin': '*',
  //       // Accept: 'application/rss+xml'
  //     })
  //   };
  //   const podcastList = this.http.get(PodcastPaths.EXPLEARNING_PRIMARY, httpOptions)
  //     .pipe(
  //       switchMap(podcastXml => {
  //         const parsedXmlPromise = new Promise<{}>((res, rej) => {
  //           xml2js.parseString(podcastXml, (err, result) => {
  //             console.log(result);
  //             res(result);
  //           });
  //         });

  //         return from(parsedXmlPromise);
  //       })
  //     );

  //   return podcastList;
  // }

  // getPodcastFeed() {
  //   const podcastHttpCall = this.fns.httpsCallable(PublicFunctionNames.UPDATE_PODCAST_FEED_CACHE);
  //   podcastHttpCall('')
  //     .pipe(
  //       take(1),
  //       tap(response => console.log('Podcast fetch sent', response)),
  //       catchError(error => {
  //         console.log('Error fetching podcast', error);
  //         return throwError(error);
  //       })
  //     ).subscribe();
  // }

  fetchPodcastFeed() {
    // TODO: fetch data from firebase cache collection
  }

}



