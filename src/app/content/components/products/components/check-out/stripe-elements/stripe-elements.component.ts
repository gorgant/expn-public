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
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-stripe-elements',
  templateUrl: './stripe-elements.component.html',
  styleUrls: ['./stripe-elements.component.scss']
})
export class StripeElementsComponent implements OnInit {

  @Input() billingDetailsForm: AbstractControl;
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

    this.card = elements.create('card', {
      iconStyle: 'solid',
      style: {
        base: {
          iconColor: '#2196f3', // theme accent
          color: '#000000',
          fontWeight: 400,
          fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
          fontSize: '16px',
          fontSmoothing: 'antialiased',
          ':-webkit-autofill': {
            color: '#2196f3', // theme accent
          },
          '::placeholder': {
            color: '#2196f3', // theme accent
          },
        },
        invalid: {
          iconColor: '#f44336',
          color: '#f44336', // theme warn
        },
      },
    });



    this.card.mount(this.cardElement.nativeElement);

    this.card.on('change', ({error}) => {
      this.cardErrors = error && error.message;
    });

    this.initializePaymentStatus();
  }

  async handleForm(e: Event) {
    e.preventDefault();
    const billingDetails: BillingDetails = this.billingDetailsForm.value;
    const owner: stripe.OwnerInfo = {
      name: `${billingDetails.firstName} ${billingDetails.lastName}`,
      email: billingDetails.email,
      phone: billingDetails.phone,
      address: {
        line1: billingDetails.billingOne,
        line2: billingDetails.billingTwo,
        city: billingDetails.city,
        state: billingDetails.countryCode === 'US' ? billingDetails.usStateCode : billingDetails.state,
        country: billingDetails.countryCode
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
