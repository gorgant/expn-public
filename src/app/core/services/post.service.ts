import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable, throwError, of } from 'rxjs';
import { takeUntil, map, catchError, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';
import { SharedCollectionPaths, PublicCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { Post, BlogIndexPostRef, PostKeys } from 'shared-models/posts/post.model';
import { TransferStateKeys } from 'shared-models/ssr/ssr-vars';
import { PostVars } from 'shared-models/posts/post-vars.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private blogIndexQueryField = PostKeys.PUBLISHED_DATE;
  private blogIndexQueryLimit = PostVars.POST_QUERY_LIMIT;
  private lastItemInBlogIndexQuery: BlogIndexPostRef;

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private uiService: UiService,
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState
  ) { }

  // Load a partial version of the post collection that omits the post content
  fetchBlogIndex(): Observable<BlogIndexPostRef[]> {

    const BLOG_INDEX_KEY = makeStateKey<BlogIndexPostRef[]>(TransferStateKeys.BLOG_INDEX_KEY); // A key to identify data in USSR
    // If data exists in state transfer, use that
    if (this.transferState.hasKey(BLOG_INDEX_KEY)) {
      console.log('Fetching post index from transfer state');
      const cacheData = this.transferState.get<BlogIndexPostRef[]>(BLOG_INDEX_KEY, {} as any);
      // Sort by publish date because must be same order as in Root Store in order to sync properly
      cacheData.sort((a, b) => (b.publishedDate > a.publishedDate) ? 1 : ((a.publishedDate > b.publishedDate) ? -1 : 0));
      this.transferState.remove(BLOG_INDEX_KEY); // Clean up the cache
      // Store last item for pagination functionality
      if (cacheData.length > 0) {
        const lastItem = cacheData[cacheData.length - 1];
        console.log('last item in blog index query', lastItem);
        this.lastItemInBlogIndexQuery = lastItem;
      }
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const firstBatchOfBlogIndexCollection = this.getFirstBatchOfBlogIndexCollection();
    return firstBatchOfBlogIndexCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(blogIndex => {
          console.log('Fetched blogIndex');
          // Store last item for pagination functionality
          if (blogIndex.length > 0) {
            const lastItem = blogIndex[blogIndex.length - 1];
            console.log('last item in blog index query', lastItem);
            this.lastItemInBlogIndexQuery = lastItem;
          }
          return blogIndex;
        }),
        tap(blogIndex => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(BLOG_INDEX_KEY, blogIndex); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );

  }

  fetchNextBlogIndexBatch(): Observable<BlogIndexPostRef[]> {
    // Otherwise, fetch from database
    const nextBlogIndexBatch = this.getNextBatchOfBlogIndexItems();
    return nextBlogIndexBatch.valueChanges()
      .pipe(
        take(1),
        map(nextIndexBatch => {
          console.log('Fetched next blog index batch');
          // Store last item for pagination functionality
          if (nextIndexBatch.length > 0) {
            const lastItem = nextIndexBatch[nextIndexBatch.length - 1];
            console.log('last item in blog index query', lastItem);
            this.lastItemInBlogIndexQuery = nextIndexBatch[nextIndexBatch.length - 1];
          } else {
            console.log('No additional index items available');
          }
          return nextIndexBatch;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  fetchFeaturedPosts(): Observable<BlogIndexPostRef[]> {

    const FEATURED_POSTS_KEY = makeStateKey<BlogIndexPostRef[]>(TransferStateKeys.FEATURED_POSTS_KEY); // A key to identify data in USSR

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(FEATURED_POSTS_KEY)) {
      console.log('Fetching featured posts from transfer state');
      const cacheData = this.transferState.get<BlogIndexPostRef[]>(FEATURED_POSTS_KEY, {} as any);
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
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  fetchSinglePost(postId: string): Observable<Post> {

    const SINGLE_POST_KEY = makeStateKey<Post>(`${postId}-${TransferStateKeys.SINGLE_POST_KEY}`); // A key to identify data in USSR

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
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  private getPostsCollection(): AngularFirestoreCollection<Post> {

    return this.afs.collection<Post>(SharedCollectionPaths.POSTS);
  }

  private getFeaturedPostsCollection(): AngularFirestoreCollection<BlogIndexPostRef> {
    return this.afs.collection<BlogIndexPostRef>(PublicCollectionPaths.BLOG_INDEX, ref => ref.where(PostKeys.FEATURED, '==', true));
  }

  // private getBlogIndexCollection(): AngularFirestoreCollection<BlogIndexPostRef> {
  //   return this.afs.collection<BlogIndexPostRef>(PublicCollectionPaths.BLOG_INDEX);
  // }

  private getPostDoc(postId: string): AngularFirestoreDocument<Post> {
    return this.getPostsCollection().doc<Post>(postId);
  }

  private getFirstBatchOfBlogIndexCollection(): AngularFirestoreCollection<BlogIndexPostRef> {
    return this.afs.collection<BlogIndexPostRef>(
      PublicCollectionPaths.BLOG_INDEX,
      ref => ref
        .orderBy(this.blogIndexQueryField, 'desc')
        .limit(this.blogIndexQueryLimit)
    );
  }

  private getNextBatchOfBlogIndexItems(): AngularFirestoreCollection<BlogIndexPostRef> {
    if (!this.lastItemInBlogIndexQuery) {
      console.log('Error, no last item found');
      throw new Error('No last item in blog index query');
    }
    return this.afs.collection<BlogIndexPostRef>(
      PublicCollectionPaths.BLOG_INDEX,
      ref => ref
        .orderBy(this.blogIndexQueryField, 'desc')
        .startAfter(this.lastItemInBlogIndexQuery.publishedDate)
        .limit(this.blogIndexQueryLimit)
    );
  }
}
