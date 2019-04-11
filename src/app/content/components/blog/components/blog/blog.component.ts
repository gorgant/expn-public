import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, PostStoreSelectors, PostStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { Post } from 'src/app/core/models/posts/post.model';
import { withLatestFrom, map } from 'rxjs/operators';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  posts$: Observable<Post[]>;
  error$: Observable<string>;
  isLoading$: Observable<boolean>;

  heroData: PageHeroData;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {

    this.heroData = {
      pageTitle: 'Explearning in Action',
      pageSubtitle: 'A collection of videos and blog posts focused on making you a better communicator',
      imageUrl: ImagePaths.BLOG
    };

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
