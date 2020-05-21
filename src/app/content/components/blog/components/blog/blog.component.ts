import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, PostStoreSelectors, PostStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { map, filter, withLatestFrom } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PageHeroData } from 'shared-models/forms-and-components/page-hero-data.model';
import { ImageProps } from 'shared-models/images/image-props.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { BlogIndexPostRef } from 'shared-models/posts/post.model';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {

  posts$: Observable<BlogIndexPostRef[]>;
  error$: Observable<string>;
  isLoading$: Observable<boolean>;
  requestBlogIndex: boolean;

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

    const title = `Blog - ${metaTagDefaults.explearningPublic.metaTagSiteName}`;
    // tslint:disable-next-line:max-line-length
    const description = `On Explearning's blog you have access to our complete library of free lessons on speaking skills and effective communication. From public speaking techniques to interview strategies and negotiation tactics, our goal is to make you the best communicator you can be.`;
    const localImagePath = metaTagDefaults.explearningPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.BLOG;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
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
      pageHeroSubtitle: `Access our complete library of free lessons on speaking skills and effective communication`,
      imageProps: blogImageProps,
      actionMessage: 'View Collection'
    };
  }

  private initializePosts() {

    this.error$ = this.store$.select(PostStoreSelectors.selectLoadError);

    this.posts$ = this.store$.select(PostStoreSelectors.selectblogIndex)
      .pipe(
          withLatestFrom(this.store$.select(PostStoreSelectors.selectBlogIndexLoaded)),
          map(([posts, blogIndexLoaded]) => {
            if (!blogIndexLoaded && !this.requestBlogIndex) {
              console.log('No post index loaded, loading that now');
              this.requestBlogIndex = true;
              this.store$.dispatch(new PostStoreActions.BlogIndexRequested());
            }
            return posts as BlogIndexPostRef[];
          }),
          filter(posts => posts.length > 0), // Catches the first emission which is an empty array
        );

    this.isLoading$ = this.store$.select(
      PostStoreSelectors.selectIsLoading
    );
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }

}
