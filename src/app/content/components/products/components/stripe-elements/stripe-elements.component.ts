import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Product } from 'src/app/core/models/products/product.model';
import { PaymentResponseMsg } from 'src/app/core/models/billing/payment-response-msg.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors, BillingStoreActions } from 'src/app/root-store';
import { BillingDetails } from 'src/app/core/models/billing/billing-details.model';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { StripeChargeData } from 'src/app/core/models/billing/stripe-charge-data.model';
import * as StripeDefs from 'stripe';

@Component({
  selector: 'app-stripe-elements',
  templateUrl: './stripe-elements.component.html',
  styleUrls: ['./stripe-elements.component.scss']
})
export class StripeElementsComponent implements OnInit {

  @Input() billingDetails: BillingDetails;
  @Input() anonymousUser: AnonymousUser;
  @Input() product: Product;

  paymentProcessing$: Observable<boolean>;
  paymentResponse$: Observable<StripeDefs.charges.ICharge>;
  paymentResponseTypes = PaymentResponseMsg;
  paymentSubmitted: boolean;



  @ViewChild('cardElement') cardElement: ElementRef;

  stripe: stripe.Stripe;
  stripPublishableKey = 'pk_test_qiAhFPd39eG3eqgEtWM9Yx0v00p7PxdzcH';
  card: stripe.elements.Element;
  cardErrors: string;

  loading = false;
  confirmation;

  constructor(
    private store$: Store<RootStoreState.State>,
  ) { }

  ngOnInit() {
    this.stripe = Stripe(this.stripPublishableKey);
    const elements = this.stripe.elements();

    this.card = elements.create('card');
    this.card.mount(this.cardElement.nativeElement);

    this.card.on('change', ({error}) => {
      this.cardErrors = error && error.message;
    });

    this.initializePaymentStatus();
  }

  async handleForm(e: Event) {
    e.preventDefault();
    const owner: stripe.OwnerInfo = {
      name: `${this.billingDetails.firstName} ${this.billingDetails.lastName}`,
      email: this.billingDetails.email,
      phone: this.billingDetails.phone,
      address: {
        line1: this.billingDetails.billingOne,
        line2: this.billingDetails.billingTwo,
        city: this.billingDetails.city,
        state: this.billingDetails.countryCode === 'US' ? this.billingDetails.usStateCode : this.billingDetails.state,
        country: this.billingDetails.countryCode
      }
    };

    const { source, error } = await this.stripe.createSource(this.card, {owner});

    if (error) {
      // Inform the customer that there was an error.
      const cardErrors = error.message;
    } else {
      // Send the token to your server.
      const billingData: StripeChargeData = {
        source,
        anonymousUID: this.anonymousUser.id,
        priceInCents: this.product.price * 100 // Stripe prices in cents
      };

      this.paymentSubmitted = true;

      this.store$.dispatch(new BillingStoreActions.ProcessPaymentRequested({billingData}));

    }
  }

  private initializePaymentStatus() {
    this.paymentProcessing$ = this.store$.select(BillingStoreSelectors.selectPaymentProcessing);
    this.paymentResponse$ = this.store$.select(BillingStoreSelectors.selectStripeCharge);
  }

}
