import { Component, inject, signal } from '@angular/core';
import { ShorthandBusinessNames } from '../../../../../shared-models/meta/business-info.model';
import { PostCollectionComponent } from "../../blog/post-collection/post-collection.component";
import { PublicAppRoutes } from '../../../../../shared-models/routes-and-paths/app-routes.model';
import { Router, RouterLink } from '@angular/router';
import { GlobalFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { FirebaseError } from '@angular/fire/app';
import { Observable, switchMap, withLatestFrom, filter, map, catchError, throwError, take, tap, timer } from 'rxjs';
import { BlogIndexRef } from '../../../../../shared-models/posts/post.model';
import { UiService } from '../../../core/services/ui.service';
import { PostStoreSelectors, PostStoreActions, BlogIndexRefStoreSelectors, BlogIndexRefStoreActions } from '../../../root-store';
import { AsyncPipe } from '@angular/common';
import { ProcessingSpinnerComponent } from "../../../shared/components/processing-spinner/processing-spinner.component";
import { SSR_LOADING_TIMER_DURATION } from '../../../../../shared-models/ssr/ssr-loading-timer.model';

@Component({
    selector: 'app-featured-posts',
    standalone: true,
    templateUrl: './featured-posts.component.html',
    styleUrl: './featured-posts.component.scss',
    imports: [PostCollectionComponent, RouterLink, MatButtonModule, AsyncPipe, ProcessingSpinnerComponent]
})
export class FeaturedPostsComponent {

  APP_ROUTES = PublicAppRoutes;
  TITLE = ShorthandBusinessNames.EXPN;

  SEE_MORE_BUTTON_VALUE = GlobalFieldValues.SEE_MORE;

  private store$ = inject(Store);
  private uiService = inject(UiService);
  private router = inject(Router);

  private $fetchBlogIndexRefsSubmitted = signal(false);
  featuredBlogIndexRefs$!: Observable<BlogIndexRef[]>
  private allBlogIndexRefsFetched$!: Observable<boolean>;
  private fetchAllBlogIndexRefsError$!: Observable<FirebaseError | Error | null>
  private fetchAllBlogIndexRefsProcessing$!: Observable<boolean>;

  ngOnInit(): void {
    this.monitorProcesses();
    this.fetchBlogIndexRefs();
    if (this.uiService.$isServerPlatform()) {
      timer(SSR_LOADING_TIMER_DURATION).subscribe(() => {
        console.log(`${SSR_LOADING_TIMER_DURATION} millis ssr loading timer completed`);
      });
    }
  }

  private monitorProcesses() {
    this.allBlogIndexRefsFetched$ = this.store$.select(BlogIndexRefStoreSelectors.selectAllBlogIndexRefsFetched);
    this.fetchAllBlogIndexRefsError$ = this.store$.select(BlogIndexRefStoreSelectors.selectFetchAllBlogIndexRefsError);
    this.fetchAllBlogIndexRefsProcessing$ = this.store$.select(BlogIndexRefStoreSelectors.selectFetchAllBlogIndexRefsProcessing);
  }

  private fetchBlogIndexRefs() {
    this.featuredBlogIndexRefs$ = this.fetchAllBlogIndexRefsError$
      .pipe(
        switchMap(processingError => {
          if (processingError) {
            console.log('processingError detected, terminating pipe', processingError);
            this.resetComponentState();
            this.navigateToHome();
          }
          const allFeaturedBlogIndexRefs = this.store$.select(BlogIndexRefStoreSelectors.selectAllFeaturedBlogIndexRefs);
          return allFeaturedBlogIndexRefs;
        }),
        withLatestFrom(this.fetchAllBlogIndexRefsError$, this.allBlogIndexRefsFetched$),
        filter(([blogIndexRefs, processingError, allFetched]) => !processingError),
        map(([blogIndexRefs, processingError, allFetched]) => {
          if (!allFetched && !this.$fetchBlogIndexRefsSubmitted()) {
            this.$fetchBlogIndexRefsSubmitted.set(true);
            this.store$.dispatch(BlogIndexRefStoreActions.fetchAllBlogIndexRefsRequested());
          }
          console.log('featured blogIndexRefs loaded into component', blogIndexRefs.length);
          return blogIndexRefs;
        }),
        filter(blogIndexRefs => blogIndexRefs.length > 0),
        // Catch any local errors
        catchError(error => {
          console.log('Error in component:', error);
          this.uiService.showSnackBar(`Something went wrong. Please try again.`, 7000);
          this.resetComponentState();
          this.navigateToHome();
          return throwError(() => new Error(error));
        })
      )
  }

  private resetComponentState() {
    this.$fetchBlogIndexRefsSubmitted.set(false);
  }

  private navigateToHome() {
    this.router.navigate([PublicAppRoutes.HOME]);
  }

  ngOnDestroy(): void {
    this.fetchAllBlogIndexRefsError$
      .pipe(
        take(1),
        tap(error => {
          if (error) {
            this.store$.dispatch(PostStoreActions.purgePostStateErrors());
          }
        })
      ).subscribe();
  }

}
