import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable, throwError, of } from 'rxjs';
import { takeUntil, map, catchError, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';
import { Post } from 'shared-models/posts/post.model';
import { SharedCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private uiService: UiService,
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState
  ) { }


  fetchAllPosts(): Observable<Post[]> {

    const POSTS_KEY = makeStateKey<Post[]>('fetchAllPostsKey'); // A key to identify data in USSR
    // If data exists in state transfer, use that
    if (this.transferState.hasKey(POSTS_KEY)) {
      console.log('Fetching posts from transfer state');
      const cacheData = this.transferState.get<Post[]>(POSTS_KEY, {} as any);
      cacheData.sort((a, b) => (b.publishedDate > a.publishedDate) ? 1 : ((a.publishedDate > b.publishedDate) ? -1 : 0));
      this.transferState.remove(POSTS_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const postCollection = this.getPostsCollection();
    return postCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(posts => {
          console.log('Fetched all posts');
          return posts;
        }),
        tap(posts => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(POSTS_KEY, posts); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchFeaturedPosts(): Observable<Post[]> {

    const FEATURED_POSTS_KEY = makeStateKey<Post[]>('fetchFeaturedPostsKey'); // A key to identify data in USSR

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(FEATURED_POSTS_KEY)) {
      console.log('Fetching featured posts from transfer state');
      const cacheData = this.transferState.get<Post[]>(FEATURED_POSTS_KEY, {} as any);
      cacheData.sort((a, b) => (b.publishedDate > a.publishedDate) ? 1 : ((a.publishedDate > b.publishedDate) ? -1 : 0));
      this.transferState.remove(FEATURED_POSTS_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const featuredPostCollection = this.getFeaturedPostsCollection();
    return featuredPostCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(posts => {
          console.log('Fetched featured posts');
          return posts;
        }),
        tap(posts => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(FEATURED_POSTS_KEY, posts); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchSinglePost(postId: string): Observable<Post> {

    const SINGLE_POST_KEY = makeStateKey<Post>(`${postId}-fetchSinglePostKey`); // A key to identify data in USSR

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(SINGLE_POST_KEY)) {
      console.log('Fetching single post from transfer state');
      const cacheData = this.transferState.get<Post>(SINGLE_POST_KEY, {} as any);
      this.transferState.remove(SINGLE_POST_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const postDoc = this.getPostDoc(postId);
    return postDoc.valueChanges()
      .pipe(
        take(1),
        map(posts => {
          console.log('Fetched single post');
          return posts;
        }),
        tap(posts => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SINGLE_POST_KEY, posts); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  private getPostsCollection(): AngularFirestoreCollection<Post> {

    return this.afs.collection<Post>(SharedCollectionPaths.POSTS);
  }

  private getFeaturedPostsCollection(): AngularFirestoreCollection<Post> {
    return this.afs.collection<Post>(SharedCollectionPaths.POSTS, ref => ref.where('featured', '==', true));
  }

  private getPostDoc(postId: string): AngularFirestoreDocument<Post> {
    return this.getPostsCollection().doc<Post>(postId);
  }
}
