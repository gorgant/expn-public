import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/compat/firestore';
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
import { BlogDomains } from 'shared-models/posts/blog-domains.model';

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

    // const fakePost: Post = {
    //   author: 'greg@stakeyourwealth.com',
    //   authorId: 'SYMJt74CETRbixzKCpX9JhzVWn63',
    //   blogDomain: BlogDomains.EXPN,
    //   content: `<p>In this Livestream, we discuss practical ways of implementing the concepts discussed in our lesson on <a href="https://stakeyourwealth.com/blog/z2v15d8e/smart-spending-tips:-calculate-your-true-cost">calculating your true cost</a>. Some of the topics we cover include:</p><ul><li>The founding principles of Stake Your Wealth</li><li>There's so much about wealth building and financial independence that they don't teach us in school</li><li>The concept of Your True Cost, weighing the price against the benefit</li><li>Why True Cost matters</li><li>Frugality vs spending money to make money</li><li>Celebrating wins and rewarding success</li><li>Soliciting outside advice on the best use of your money</li><li>Getting more value through strategic planning (rather than going cheap)</li><li>Accumulated value and what it matters</li></ul><p>Happy Wealth Staking!</p><p>&nbsp;</p>`,
    //   description: 'In our debut Stake Your Wealth live session, MD and I discuss practical examples of using Your True Cost to determine when to buy something. If you are wondering how to decide to buy something, calculating your true cost is a great place to start. Use this strategy to make smart purchases.',
    //   featured: true,
    //   id: "aabu9mx2",
    //   imageFilePathList: [],
    //   imageProps: {width: "1500", srcset: "https://firebasestorage.googleapis.com/v0/b/expn-sandbox-admin-blog/o/posts%2Faabu9mx2%2F0002_thumbnail%2Fresized%2F0002_thumbnail_thumb%40300.jpg?alt=media&token=562c7db5-e563-4648-8275-cb6d5fd60a2a 300w, https://firebasestorage.googleapis.com/v0/b/expn-sandbox-admin-blog/o/posts%2Faabu9mx2%2F0002_thumbnail%2Fresized%2F0002_thumbnail_thumb%401500.jpg?alt=media&token=562c7db5-e563-4648-8275-cb6d5fd60a2a 1500w", sizes: "100vw", src: "https://firebasestorage.googleapis.com/v0/b/expn-sandbox-admin-blog/o/posts%2Faabu9mx2%2F0002_thumbnail%2Fresized%2F0002_thumbnail_thumb%401500.jpg?alt=media&token=562c7db5-e563-4648-8275-cb6d5fd60a2a"},
    //   imageSizes: null,
    //   imagesUpdated: null,
    //   keywords: "test keywords",
    //   modifiedDate: 1600522301627,
    //   podcastEpisodeUrl: "https://soundcloud.com/user-854309119/how-to-decide-to-buy-something",
    //   published: true,
    //   publishedDate: 1600467607290,
    //   readyToPublish: true,
    //   scheduledPublishTime: null,
    //   title: "How to Decide to Buy Something",
    //   videoUrl: "https://youtu.be/29Mr9aHWs48"
    // }

    const SINGLE_POST_KEY = makeStateKey<Post>(`${postId}-${TransferStateKeys.SINGLE_POST_KEY}`); // A key to identify data in USSR

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(SINGLE_POST_KEY)) {
      console.log('Fetching single post from transfer state');
      const cacheData = this.transferState.get<Post>(SINGLE_POST_KEY, {} as any);
      this.transferState.remove(SINGLE_POST_KEY); // Clean up the cache
      return of(cacheData);
    }

    // return of(fakePost)
    //   .pipe(
    //     take(1),
    //     map(post => {
    //       console.log('DELETE FROM PRODUCTION: fake server response', fakePost); 
    //       return fakePost;
    //     }),
    //     tap(post => {
    //       if (isPlatformServer(this.platformId)) {
    //         this.transferState.set(SINGLE_POST_KEY, post); // Stash item in transfer state
    //         console.log('Post stored in transfer state');
    //       }
    //     }),
    //     catchError(error => {
    //       this.uiService.showSnackBar(error, 5000);
    //       return throwError(error);
    //     })

    //   );

    // Otherwise, fetch from database
    const postDoc = this.getPostDoc(postId);
    return postDoc.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$), // Swapping out take(1) for this prevents the SSR Universal timeout
        map(post => {
          // console.log('DELETE FROM PRODUCTION: fake server response', fakePost);
          // return fakePost;
          console.log('Fetched single post', post);
          return post;
        }),
        tap(post => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SINGLE_POST_KEY, post); // Stash item in transfer state
            console.log('Post stored in transfer state');
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
