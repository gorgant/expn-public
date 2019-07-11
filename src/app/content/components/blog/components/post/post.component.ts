import { Component, OnInit, SecurityContext, OnDestroy } from '@angular/core';
import { Post } from 'src/app/core/models/posts/post.model';
import { Observable, Subscription } from 'rxjs';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { Store } from '@ngrx/store';
import { RootStoreState, PostStoreSelectors, PostStoreActions } from 'src/app/root-store';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { withLatestFrom, map } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {

  postId: string;
  post$: Observable<Post>;
  error$: Observable<string>;
  errorSubscription: Subscription;
  isLoading$: Observable<boolean>;
  postLoaded: boolean;
  titleSet: boolean;
  postSubscription: Subscription;

  heroData: PageHeroData;

  sanitizedPostBody: SafeHtml;
  videoHtml: SafeHtml;


  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadExistingPostData();
    this.handlePostError();
  }


  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics(post: Post) {

    const title = `${post.title} - Explearning`;
    const description = post.description;
    const localImagePath = this.heroData.imageProps.src;
    const keywords = post.keywords;
    const type = 'article';

    this.analyticsService.setSeoTags(title, description, localImagePath, keywords, type);
    this.analyticsService.logPageViewWithCustomDimensions();
    this.analyticsService.createNavStamp();
  }

  private loadExistingPostData() {
    // Check if id params are available
    const idParamName = 'id';
    const idParam: string = this.route.snapshot.params[idParamName];
    if (idParam) {
      this.postId = idParam.toLowerCase(); // Remove any possible erroneous lowercasing (IDs are specifically set to lower case in admin)
      this.getPost();
      this.initializeHeroAndPostContent();
    }
  }

  // Triggered after params are fetched
  private getPost() {
    this.error$ = this.store$.select(PostStoreSelectors.selectPostError);
    this.post$ = this.store$.select(PostStoreSelectors.selectPostById(this.postId))
    .pipe(
      withLatestFrom(
        this.store$.select(PostStoreSelectors.selectPostsLoaded)
      ),
      map(([post, postsLoaded]) => {
        // Check if items are loaded, if not fetch from server
        if (!postsLoaded && !this.postLoaded) {
          console.log('No post in store, fetching from server', this.postId);
          this.store$.dispatch(new PostStoreActions.SinglePostRequested({postId: this.postId}));
        }
        this.postLoaded = true; // Prevents loading from firing more than needed
        return post;
      })
    );

    this.error$ = this.store$.select(
      PostStoreSelectors.selectPostError
    );

    this.isLoading$ = this.store$.select(
      PostStoreSelectors.selectPostIsLoading
    );
  }

  // If post data available, patch values into form
  private initializeHeroAndPostContent() {
    this.postSubscription = this.post$
      .subscribe(post => {
        console.log('post subscription firing');
        if (post) {
          this.initializeHeroData(post);
          this.sanitizedPostBody = this.sanitizer.sanitize(SecurityContext.HTML, post.content);
          if (post.videoUrl) {
            this.configureVideoUrl(post.videoUrl);
          }
        }
      });
  }

  private configureVideoUrl(videoUrl: string) {
    const videoId = videoUrl.split('/').pop();
    // tslint:disable-next-line:max-line-length
    const embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    const safeVideoLink = this.sanitizer.bypassSecurityTrustHtml(embedHtml);
    this.videoHtml = safeVideoLink;
    console.log('video data loaded', this.videoHtml);
  }

  private initializeHeroData(post: Post) {
    console.log('Initializing hero data with this post', post);
    this.heroData = {
      pageTitle: post.title,
      pageSubtitle: null,
      imageProps: post.imageProps,
      actionMessage: 'Read More',
      isPost: true
    };

    if (post && !this.titleSet) {
      this.configSeoAndAnalytics(post); // Set page view once title is loaded
      this.titleSet = true;
    }
  }

  private handlePostError() {
    this.error$.subscribe(error => {
      if (error) {
        this.router.navigate([PublicAppRoutes.BLOG]);
        console.log('Post load error, routing to blog');
      }
    });
  }

  ngOnDestroy() {
    if (this.postSubscription) {
      this.postSubscription.unsubscribe();
    }

    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }

    this.analyticsService.closeNavStamp();
  }

}
