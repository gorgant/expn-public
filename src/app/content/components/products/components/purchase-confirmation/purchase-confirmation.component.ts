import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';
import * as StripeDefs from 'stripe';

@Component({
  selector: 'app-purchase-confirmation',
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.scss']
})
export class PurchaseConfirmationComponent implements OnInit {

  purchaseData$: Observable<StripeDefs.charges.ICharge>;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializePurchaseData();
  }

  private initializePurchaseData() {
    // Load purchase data from store
    this.purchaseData$ = this.store$.select(
      BillingStoreSelectors.selectStripeCharge
    ) as Observable<StripeDefs.charges.ICharge>;
  }
}
