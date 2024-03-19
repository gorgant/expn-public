import { Injectable, TransferState, inject, makeStateKey } from '@angular/core';
import { Timestamp, collection, doc, docData, DocumentReference, CollectionReference, Firestore } from '@angular/fire/firestore';
import { UiService } from './ui.service';
import { Observable, Subject, catchError, map, of, shareReplay, takeUntil, throwError } from 'rxjs';
import { Post, PostKeys } from '../../../../shared-models/posts/post.model';
import { SharedCollectionPaths } from '../../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { AuthService } from './auth.service';
import { Functions } from '@angular/fire/functions';
import { HelperService } from './helpers.service';
import { POST_BOILERPLATE_DOCUMENT_ID, PostBoilerplate, PostBoilerplateKeys } from '../../../../shared-models/posts/post-boilerplate.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private deletePostTriggered$: Subject<void> = new Subject();

  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private uiService = inject(UiService);
  private helperService = inject(HelperService);
  private transferState = inject(TransferState);


  constructor() { }

  fetchPostBoilerplate(): Observable<PostBoilerplate> {
    const POST_BOILERPLATE_KEY = makeStateKey<PostBoilerplate>(POST_BOILERPLATE_DOCUMENT_ID);
    if (this.transferState.hasKey(POST_BOILERPLATE_KEY)) {
      console.log('postBoilerplate found in transferState with this key', POST_BOILERPLATE_KEY);
      const cachedPostBoilerplate = this.transferState.get<PostBoilerplate | null>(POST_BOILERPLATE_KEY, null);
      this.transferState.remove(POST_BOILERPLATE_KEY); // Clean up cache
      return of(cachedPostBoilerplate!);
    }

    const postBoilerplateDocRef = this.getPostBoilerplateDoc();
    const postBoilerplateDoc = docData(postBoilerplateDocRef);

    return postBoilerplateDoc
      .pipe(
        map(postBoilerplate => {
          if (!postBoilerplate) {
            throw new Error(`Error fetching postBoilerplate with id: ${POST_BOILERPLATE_DOCUMENT_ID}`);
          }
          
          const formattedPostBoilerplate: PostBoilerplate = {
            ...postBoilerplate,
            [PostBoilerplateKeys.CREATED_TIMESTAMP]: (postBoilerplate[PostBoilerplateKeys.CREATED_TIMESTAMP] as Timestamp).toMillis(),
            [PostBoilerplateKeys.LAST_MODIFIED_TIMESTAMP]: (postBoilerplate[PostBoilerplateKeys.LAST_MODIFIED_TIMESTAMP] as Timestamp).toMillis(),
          };
          console.log(`Fetched postBoilerplate`);
          if (this.uiService.$isServerPlatform()) {
            console.log('Setting postBoilerplate in transferState');
            this.transferState.set(POST_BOILERPLATE_KEY, postBoilerplate);
          }
          return formattedPostBoilerplate;
        }),
        shareReplay(),
        catchError(error => {
          this.uiService.showSnackBar(error.message, 10000);
          console.log(`Error fetching postBoilerplate`, error);
          return throwError(() => new Error(error));
        })
      );
  }

  fetchSinglePost(postId: string): Observable<Post> {
    const POST_KEY = makeStateKey<Post>('post-' + postId);
    if (this.transferState.hasKey(POST_KEY)) {
      console.log('post found in transferState with this key', POST_KEY);
      const cachedPost = this.transferState.get<Post | null>(POST_KEY, null);
      this.transferState.remove(POST_KEY); // Clean up cache
      return of(cachedPost!);
    } 

    const postDocRef = this.getPostDoc(postId);
    const postDoc = docData(postDocRef);

    return postDoc
      .pipe(
        takeUntil(this.deletePostTriggered$),
        map(post => {
          if (!post) {
            throw new Error(`Error fetching post with id: ${postId}`);
          }
          const formattedPost: Post = {
            ...post,
            [PostKeys.CREATED_TIMESTAMP]: (post[PostKeys.CREATED_TIMESTAMP] as Timestamp).toMillis(),
            [PostKeys.IMAGES_LAST_UPDATED_TIMESTAMP]: post[PostKeys.IMAGES_LAST_UPDATED_TIMESTAMP] ? (post[PostKeys.IMAGES_LAST_UPDATED_TIMESTAMP] as Timestamp).toMillis() : null,
            [PostKeys.LAST_MODIFIED_TIMESTAMP]: (post[PostKeys.LAST_MODIFIED_TIMESTAMP] as Timestamp).toMillis(),
            [PostKeys.PUBLISHED_TIMESTAMP]: post[PostKeys.PUBLISHED_TIMESTAMP] ? (post[PostKeys.PUBLISHED_TIMESTAMP] as Timestamp).toMillis() : null,
            [PostKeys.SCHEDULED_AUTOPUBLISH_TIMESTAMP]: post[PostKeys.SCHEDULED_AUTOPUBLISH_TIMESTAMP] ? (post[PostKeys.SCHEDULED_AUTOPUBLISH_TIMESTAMP] as Timestamp).toMillis() : null,
          };
          console.log(`Fetched single post`, formattedPost[PostKeys.ID]);
          if (this.uiService.$isServerPlatform()) {
            console.log('Setting post in transferState', post[PostKeys.ID]);
            this.transferState.set(POST_KEY, post);
          }
          return formattedPost;
        }),
        shareReplay(),
        catchError(error => {
          this.uiService.showSnackBar(error.message, 10000);
          console.log(`Error fetching post`, error);
          return throwError(() => new Error(error));
        })
      );
  }

  private getPostCollection(): CollectionReference<Post> {
    return collection(this.firestore, SharedCollectionPaths.POSTS) as CollectionReference<Post>;
  }

  private getPostDoc(postId: string): DocumentReference<Post> {
    return doc(this.getPostCollection(), postId);
  }

  private getSharedResourcesCollection(): CollectionReference<any> {
    return collection(this.firestore, SharedCollectionPaths.SHARED_RESOURCES) as CollectionReference<any>;
  }

  private getPostBoilerplateDoc(): DocumentReference<PostBoilerplate> {
    return doc(this.getSharedResourcesCollection(), POST_BOILERPLATE_DOCUMENT_ID);
  }

}
