import { Injectable, TransferState, inject, makeStateKey } from '@angular/core';
import { CollectionReference, collection, orderBy, DocumentReference, doc, Query, query, Firestore, Timestamp, collectionData } from '@angular/fire/firestore';
import { BlogIndexRef, PostKeys } from '../../../../shared-models/posts/post.model';
import { SharedCollectionPaths } from '../../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { Observable, map, shareReplay, catchError, throwError, of } from 'rxjs';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class BlogIndexRefService {

  private firestore = inject(Firestore);
  private transferState = inject(TransferState);
  private uiService = inject(UiService);

  constructor() { }

  fetchAllBlogIndexRefs(): Observable<BlogIndexRef[]> {
    const ALL_BLOG_INDEX_REFS_KEY = makeStateKey<BlogIndexRef[]>('allBlogIndexRefs');
    if (this.transferState.hasKey(ALL_BLOG_INDEX_REFS_KEY)) {
      const cachedBlogIndexRefs = this.transferState.get<BlogIndexRef[] | null>(ALL_BLOG_INDEX_REFS_KEY, null);
      this.transferState.remove(ALL_BLOG_INDEX_REFS_KEY); // Clean up cache
      if (cachedBlogIndexRefs && cachedBlogIndexRefs.length > 50) {
        console.log(`${cachedBlogIndexRefs.length} blogIndexRefs found in transferState with this key`, ALL_BLOG_INDEX_REFS_KEY);
        return of(cachedBlogIndexRefs!);
      }
    }

    const blogIndexRefCollectionRef = this.getBlogIndexRefCollectionByDate();
    const blogIndexRefCollectionDataRequest = collectionData(blogIndexRefCollectionRef) as Observable<BlogIndexRef[]>;

    return blogIndexRefCollectionDataRequest
      .pipe(
        map(blogIndexRefs => {
          if (!blogIndexRefs) {
            throw new Error(`Error fetching blogIndexRefs`);
          }
          const blogIndexRefsWithUpdatedTimestamps = blogIndexRefs.map(blogIndexRef => {
            const formattedPosts: BlogIndexRef = {
              ...blogIndexRef,
              [PostKeys.CREATED_TIMESTAMP]: (blogIndexRef[PostKeys.CREATED_TIMESTAMP] as Timestamp).toMillis(),
              [PostKeys.LAST_MODIFIED_TIMESTAMP]: (blogIndexRef[PostKeys.LAST_MODIFIED_TIMESTAMP] as Timestamp).toMillis(),
              [PostKeys.PUBLISHED_TIMESTAMP]: blogIndexRef[PostKeys.PUBLISHED_TIMESTAMP] ? (blogIndexRef[PostKeys.PUBLISHED_TIMESTAMP] as Timestamp).toMillis() : null,
              [PostKeys.SCHEDULED_AUTOPUBLISH_TIMESTAMP]: blogIndexRef[PostKeys.SCHEDULED_AUTOPUBLISH_TIMESTAMP] ? (blogIndexRef[PostKeys.SCHEDULED_AUTOPUBLISH_TIMESTAMP] as Timestamp).toMillis() : null,
            };
            return formattedPosts;
            
          });
          console.log(`Fetched all ${blogIndexRefsWithUpdatedTimestamps.length} blogIndexRefs`);
          if (this.uiService.$isServerPlatform()) {
            console.log('Setting allBlogIndexRefs in transferState');
            this.transferState.set(ALL_BLOG_INDEX_REFS_KEY, blogIndexRefsWithUpdatedTimestamps);
          }
          return blogIndexRefsWithUpdatedTimestamps;
        }),
        shareReplay(),
        catchError(error => {
          this.uiService.showSnackBar(error.message, 10000);
          console.log('Error fetching blogIndexRefs', error);
          return throwError(() => new Error(error));
        })
      );
  }

  private getBlogIndexRefCollection(): CollectionReference<BlogIndexRef> {
    return collection(this.firestore, SharedCollectionPaths.BLOG_INDEX_REFS) as CollectionReference<BlogIndexRef>;
  }

  private getBlogIndexRefCollectionByDate(): Query<BlogIndexRef> {
    const blogIndexRefCollectionRef = collection(this.firestore, SharedCollectionPaths.BLOG_INDEX_REFS) as CollectionReference<BlogIndexRef>;
    const collectionRefOrderedByIndex = query(blogIndexRefCollectionRef, orderBy(PostKeys.PUBLISHED_TIMESTAMP, 'desc'));
    return collectionRefOrderedByIndex;
  }

  private getBlogIndexRefDoc(postId: string): DocumentReference<BlogIndexRef> {
    return doc(this.getBlogIndexRefCollection(), postId);
  }
}
