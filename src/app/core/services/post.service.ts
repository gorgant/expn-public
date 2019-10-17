import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable, throwError } from 'rxjs';
import { takeUntil, map, catchError, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';
import { Post } from 'shared-models/posts/post.model';
import { SharedCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private uiService: UiService
  ) { }


  fetchAllPosts(): Observable<Post[]> {
    const postCollection = this.getPostsCollection();
    return postCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(posts => {
          console.log('Fetched all posts');
          return posts;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchFeaturedPosts(): Observable<Post[]> {
    const featuredPostCollection = this.getFeaturedPostsCollection();
    return featuredPostCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(posts => {
          console.log('Fetched featured posts');
          return posts;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchSinglePost(postId: string): Observable<Post> {
    const postDoc = this.getPostDoc(postId);
    return postDoc.valueChanges()
      .pipe(
        take(1),
        map(post => post),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  private getPostsCollection(): AngularFirestoreCollection<Post> {

    // // Googlebot can't ingest more than 15 in one go, will implement pagination to deal with this
    // return this.afs.collection<Post>(SharedCollectionPaths.POSTS, ref => ref.limit(15));
    return this.afs.collection<Post>(SharedCollectionPaths.POSTS);
  }

  private getFeaturedPostsCollection(): AngularFirestoreCollection<Post> {
    return this.afs.collection<Post>(SharedCollectionPaths.POSTS, ref => ref.where('featured', '==', true));
  }

  private getPostDoc(postId: string): AngularFirestoreDocument<Post> {
    return this.getPostsCollection().doc<Post>(postId);
  }
}
