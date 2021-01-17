import { Component, OnInit, Input, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreActions } from 'src/app/root-store';
import { Router } from '@angular/router';
import { Product } from 'shared-models/products/product.model';
import { PublicIconPaths } from 'shared-models/routes-and-paths/icon-paths.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { EmailSenderAddresses } from 'shared-models/email/email-vars.model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-buy-now-box',
  templateUrl: './buy-now-box.component.html',
  styleUrls: ['./buy-now-box.component.scss']
})
export class BuyNowBoxComponent implements OnInit {

  @Input() product: Product;

  iconPaths = PublicIconPaths;

  title: string;
  subtitle: string;
  buttonText: string;

  ordersEmail = EmailSenderAddresses.EXPN_ORDERS;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {

  }

  onBuyNow() {
    // // If skillshare active, route user to Skillshare
    // if (this.product.skillshareActive) {
    //   this.document.location.href = this.product.skillshareUrl;
    //   return;
    // }
    this.store$.dispatch(new UserStoreActions.SetCartData({productData: this.product}));
    this.router.navigate([PublicAppRoutes.CHECKOUT]);
  }

}
