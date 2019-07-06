import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, PostStoreSelectors, PostStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { Post } from 'src/app/core/models/posts/post.model';
import { withLatestFrom, map } from 'rxjs/operators';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { ImageProps } from 'src/app/core/models/images/image-props.model';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {

  posts$: Observable<Post[]>;
  error$: Observable<string>;
  isLoading$: Observable<boolean>;

  heroData: PageHeroData;

  constructor(
    private store$: Store<RootStoreState.State>,
    private analyticsService: AnalyticsService,
  ) { }

  ngOnInit() {
    this.initializePosts();
    this.initializeHeroData();
    this.configSeoAndAnalytics();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const title = `Blog - Explearning`;
    // tslint:disable-next-line:max-line-length
    const description = `On Explearning's blog you have access to our complete library of free lessons on speaking skills and effective communication. From public speaking techniques to interview strategies and negotiation tactics, our goal is to make you the best communicator you can be.`;
    const localImagePath = this.heroData.imageProps.src;

    this.analyticsService.setSeoTags(title, description, localImagePath);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
  }

  private initializeHeroData() {
    const blogImageProps: ImageProps = {
      src: PublicImagePaths.BLOG,
      sizes: null,
      srcset: null,
      width: null,
    };

    this.heroData = {
      pageTitle: 'Explearning Blog',
      pageSubtitle: `Access our complete library of free lessons on speaking skills and effective communication`,
      imageProps: blogImageProps,
      actionMessage: 'View Collection'
    };
  }

  private initializePosts() {
    this.posts$ = this.store$.select(PostStoreSelectors.selectAllPosts)
    .pipe(
      withLatestFrom(
        this.store$.select(PostStoreSelectors.selectPostsLoaded)
      ),
      map(([posts, postsLoaded]) => {
        // Check if posts are loaded, if not fetch from server
        if (!postsLoaded) {
          console.log('No posts loaded, loading those now');
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

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
