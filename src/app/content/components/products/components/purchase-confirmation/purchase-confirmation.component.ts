import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';
import * as StripeDefs from 'stripe';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics/analytics.service';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-purchase-confirmation',
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.scss']
})
export class PurchaseConfirmationComponent implements OnInit, OnDestroy {

  purchaseData$: Observable<StripeDefs.charges.ICharge>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private titleService: Title,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.configSeoAndAnalytics();
    this.initializePurchaseData();
  }

  // Add async data as needed and fire once loaded
  private configSeoAndAnalytics() {

    const canonicalUrlPath = PublicAppRoutes.PURCHASE_CONFIRMATION;

    this.titleService.setTitle(`Purchase Confirmation - ${metaTagDefaults.explearningPublic.metaTagSiteName}`);
    this.analyticsService.logPageViewWithCustomDimensions(canonicalUrlPath);
    this.analyticsService.createNavStamp(canonicalUrlPath);
  }

  private initializePurchaseData() {
    // Load purchase data from store
    this.purchaseData$ = this.store$.select(
      BillingStoreSelectors.selectStripeCharge
    ) as Observable<StripeDefs.charges.ICharge>;
  }

  ngOnDestroy() {
    this.analyticsService.closeNavStamp();
  }
}
