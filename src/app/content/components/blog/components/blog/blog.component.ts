import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, PostStoreSelectors, PostStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { Post } from 'src/app/core/models/posts/post.model';
import { withLatestFrom, map } from 'rxjs/operators';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  posts$: Observable<Post[]>;
  error$: Observable<string>;
  isLoading$: Observable<boolean>;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {

    this.posts$ = this.store$.select(PostStoreSelectors.selectAllPosts)
      .pipe(
        withLatestFrom(
          this.store$.select(PostStoreSelectors.selectPostsLoaded)
        ),
        map(([posts, postsLoaded]) => {
          if (!postsLoaded) {
            this.store$.dispatch(new PostStoreActions.AllPostsRequested());
          }
          return posts;
        })
      );

    this.error$ = this.store$.select(
      PostStoreSelectors.selectPostError
    );

    this.isLoading$ = this.store$.select(
      PostStoreSelectors.selectPostIsLoading
    );

  }

}
