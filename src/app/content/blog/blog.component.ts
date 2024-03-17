import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { BlogHeroComponent } from "./blog-hero/blog-hero.component";
import { PostCollectionComponent } from "./post-collection/post-collection.component";
import { Store } from '@ngrx/store';
import { BlogIndexRefStoreActions, BlogIndexRefStoreSelectors, PostStoreActions } from '../../root-store';
import { Observable, catchError, filter, map, switchMap, take, tap, throwError, timer, withLatestFrom } from 'rxjs';
import { FirebaseError } from '@angular/fire/app';
import { BlogIndexRef } from '../../../../shared-models/posts/post.model';
import { UiService } from '../../core/services/ui.service';
import { Router } from '@angular/router';
import { AdminAppRoutes, PublicAppRoutes } from '../../../../shared-models/routes-and-paths/app-routes.model';
import { AsyncPipe } from '@angular/common';
import { ProcessingSpinnerComponent } from "../../shared/components/processing-spinner/processing-spinner.component";
import { AnalyticsService } from '../../core/services/analytics.service';
import { SiteSpecificFieldValues } from '../../../../shared-models/content/string-vals.model';
import { metaTagDefaults } from '../../../../shared-models/meta/metatags.model';
import { SSR_LOADING_TIMER_DURATION } from '../../../../shared-models/ssr/ssr-loading-timer.model';

@Component({
    selector: 'app-blog',
    standalone: true,
    templateUrl: './blog.component.html',
    styleUrl: './blog.component.scss',
    imports: [BlogHeroComponent, PostCollectionComponent, AsyncPipe, ProcessingSpinnerComponent]
})
export class BlogComponent implements OnInit, OnDestroy {

  private $fetchBlogIndexRefsSubmitted = signal(false);
  private allBlogIndexRefsFetched$!: Observable<boolean>;
  private fetchAllBlogIndexRefsError$!: Observable<FirebaseError | Error | null>;
  private fetchAllBlogIndexRefsProcessing$!: Observable<boolean>;
  
  allBlogIndexRefs$!: Observable<BlogIndexRef[]>;

  private analyticsService = inject(AnalyticsService);
  private store$ = inject(Store);
  private uiService = inject(UiService);
  private router = inject(Router);


  ngOnInit(): void {
    this.monitorProcesses();
    this.fetchBlogIndexRefs();
    this.configSeoAndAnalytics();
    if (this.uiService.$isServerPlatform()) {
      timer(SSR_LOADING_TIMER_DURATION + 200).subscribe(() => {
        console.log(`${SSR_LOADING_TIMER_DURATION} millis ssr loading timer completed`);
      });
    }
  }

  private configSeoAndAnalytics() {

    const title = SiteSpecificFieldValues.expnPublic.blogMetaTitle;
    const description = SiteSpecificFieldValues.expnPublic.blogMetaDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.BLOG;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }

  private monitorProcesses() {
    this.allBlogIndexRefsFetched$ = this.store$.select(BlogIndexRefStoreSelectors.selectAllBlogIndexRefsFetched);
    this.fetchAllBlogIndexRefsError$ = this.store$.select(BlogIndexRefStoreSelectors.selectFetchAllBlogIndexRefsError);
    this.fetchAllBlogIndexRefsProcessing$ = this.store$.select(BlogIndexRefStoreSelectors.selectFetchAllBlogIndexRefsProcessing);
  }

  private fetchBlogIndexRefs() {
    this.allBlogIndexRefs$ = this.fetchAllBlogIndexRefsError$
      .pipe(
        switchMap(processingError => {
          if (processingError) {
            console.log('processingError detected, terminating pipe', processingError);
            this.resetComponentState();
            this.navigateToHome();
          }
          const allBlogIndexRefsInStore = this.store$.select(BlogIndexRefStoreSelectors.selectAllBlogIndexRefsInStore);
          return allBlogIndexRefsInStore;
        }),
        withLatestFrom(this.fetchAllBlogIndexRefsError$, this.allBlogIndexRefsFetched$),
        filter(([blogIndexRefs, processingError, allFetched]) => !processingError),
        map(([blogIndexRefs, processingError, allFetched]) => {
          if (!allFetched && !this.$fetchBlogIndexRefsSubmitted()) {
            this.$fetchBlogIndexRefsSubmitted.set(true);
            this.store$.dispatch(BlogIndexRefStoreActions.fetchAllBlogIndexRefsRequested());
          }
          console.log('blogIndexRefs loaded into component', blogIndexRefs.length);
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
    this.store$.dispatch(PostStoreActions.purgePostStateErrors());
  }

  private navigateToHome() {
    this.router.navigate([AdminAppRoutes.HOME]);
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
