import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Post } from '../models/posts/post.model';
import { Observable, throwError } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';

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
          console.log('Fetched all posts', posts);
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
          console.log('Fetched featured posts', posts);
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
        takeUntil(this.authService.unsubTrigger$),
        map(post => post),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  private getPostsCollection(): AngularFirestoreCollection<Post> {
    return this.afs.collection<Post>('posts', ref => ref.orderBy('publishedDate', 'desc'));
  }

  private getFeaturedPostsCollection(): AngularFirestoreCollection<Post> {
    return this.afs.collection<Post>('posts', ref => ref.where('featured', '==', true));
  }

  private getPostDoc(postId: string): AngularFirestoreDocument<Post> {
    return this.getPostsCollection().doc<Post>(postId);
  }
}
