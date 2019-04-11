import { Component, OnInit, SecurityContext } from '@angular/core';
import { Post } from 'src/app/core/models/posts/post.model';
import { Observable } from 'rxjs';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { Store } from '@ngrx/store';
import { RootStoreState, PostStoreSelectors, PostStoreActions } from 'src/app/root-store';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { withLatestFrom, map, take } from 'rxjs/operators';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  postId: string;
  post$: Observable<Post>;
  error$: Observable<string>;
  isLoading$: Observable<boolean>;

  heroData: PageHeroData;

  sanitizedPostBody: SafeHtml;
  videoHtml: SafeHtml;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.loadExistingPostData();

  }



  private loadExistingPostData() {
    // Check if id params are available
    const idParamName = 'id';
    const idParam = this.route.snapshot.params[idParamName];
    if (idParam) {
      this.postId = idParam;
      this.getPost();
      this.initializePostContent();
    }
  }

  // Triggered after params are fetched
  private getPost() {
    this.post$ = this.store$.select(PostStoreSelectors.selectPostById(this.postId))
    .pipe(
      withLatestFrom(
        this.store$.select(PostStoreSelectors.selectPostsLoaded)
      ),
      map(([post, postsLoaded]) => {
        // Check if posts are loaded, if not fetch from server
        if (!postsLoaded) {
          this.store$.dispatch(new PostStoreActions.SinglePostRequested({postId: this.postId}));
        }
        this.initializeHeroData(post);
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
  private initializePostContent() {
    this.post$
    .pipe(take(1))
    .subscribe(post => {
      if (post) {
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
    this.heroData = {
      pageTitle: post.title,
      imageUrl: post.heroImageProps.src,
      actionMessage: 'Read More'
    };
  }

}
