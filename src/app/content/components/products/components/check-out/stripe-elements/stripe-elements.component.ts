import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Product } from 'src/app/core/models/products/product.model';
import { Observable } from 'rxjs';
import { withLatestFrom, takeWhile } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { RootStoreState, BillingStoreSelectors, BillingStoreActions, UserStoreActions } from 'src/app/root-store';
import { BillingDetails } from 'src/app/core/models/billing/billing-details.model';
import { PublicUser } from 'src/app/core/models/user/public-user.model';
import { StripeChargeData } from 'src/app/core/models/billing/stripe-charge-data.model';
import * as StripeDefs from 'stripe';
import { AbstractControl } from '@angular/forms';
import { StripeError } from 'src/app/core/models/billing/stripe-error.model';
import { Router } from '@angular/router';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { SubscriptionSource } from 'src/app/core/models/subscribers/subscription-source.model';
import { EmailSubData } from 'src/app/core/models/subscribers/email-sub-data.model';
import { environment } from 'src/environments/environment';
import { ProductionStripePublishableKeys, SandboxStripePublishableKeys } from 'src/app/core/models/environments/env-vars.model';

@Component({
  selector: 'app-stripe-elements',
  templateUrl: './stripe-elements.component.html',
  styleUrls: ['./stripe-elements.component.scss']
})
export class StripeElementsComponent implements OnInit, OnDestroy {

  @Input() billingDetailsForm: AbstractControl;
  @Input() publicUser: PublicUser;
  @Input() product: Product;

  paymentProcessing$: Observable<boolean>;
  paymentResponse$: Observable<StripeDefs.charges.ICharge | StripeError>;
  paymentSubmitted: boolean;
  paymentSucceeded: boolean;



  @ViewChild('cardElement', { static: true }) cardElement: ElementRef;

  stripe: stripe.Stripe;
  stripePublishableKey: string;
  card: stripe.elements.Element;
  cardErrors: string;

  loading = false;

  private productionEnvironment: boolean = environment.production;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router
  ) { }

  ngOnInit() {
    this.setStripeKeyBasedOnEnvironment();
    this.initializeStripeElement();
    this.initializePaymentStatus();
  }

  private setStripeKeyBasedOnEnvironment() {
    switch (this.productionEnvironment) {
      case true:
        console.log('Setting publishable key to production');
        this.stripePublishableKey = ProductionStripePublishableKeys.PUBLISHABLE;
        break;
      case false:
        console.log('Setting publishable key to sandbox');
        this.stripePublishableKey = SandboxStripePublishableKeys.PUBLISHABLE;
        break;
      default:
        this.stripePublishableKey = SandboxStripePublishableKeys.PUBLISHABLE;
        break;
    }
  }

  async onSubmitPayment(e: Event) {
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
      this.cardErrors = error.message;
    } else {
      // Send the token to your server.
      const billingData: StripeChargeData = {
        source,
        publicUserId: this.publicUser.id,
        amountPaid: this.product.price * 100, // Stripe prices in cents,
        product: this.product
      };

      this.paymentSubmitted = true;

      this.store$.dispatch(new BillingStoreActions.ProcessPaymentRequested({billingData}));

      // Update UI based on response from Stripe
      this.paymentProcessing$
        .pipe(
          withLatestFrom(this.paymentResponse$),
          takeWhile(() => this.paymentSubmitted) // Prevents memory leak between attempts
        )
        .subscribe(([processing, response]) => {
          console.log('Observable fired', processing, response);

          // Listen for success
          const charge = response as StripeDefs.charges.ICharge;
          if (charge && charge.status === 'succeeded') {
            this.postChargeSuccessActions(charge);
          }

          // Listen for failure
          const err = response as StripeError;
          if (err && err.stripeErrorType) {
            this.paymentSucceeded = false;
            this.paymentSubmitted = false;
            console.log('Charge failed, resetting payment loop');
          }
        });
    }
  }

  // Various actions to be performed if charge is successful
  private postChargeSuccessActions(stripeCharge: StripeDefs.charges.ICharge) {
    this.paymentSucceeded = true;
    this.paymentSubmitted = false; // Closes out the payment processing subscription

    // Transmit order to admin
    this.store$.dispatch(new BillingStoreActions.TransmitOrderToAdminRequested({stripeCharge, user: this.publicUser}));


    // Subscribe the customer to email list
    const emailSubData: EmailSubData = {
      user: this.publicUser,
      subSource: SubscriptionSource.CHECKOUT,
    };
    this.store$.dispatch( new UserStoreActions.SubscribeUserRequested({emailSubData}));
    console.log('Charge succeeded, closing payment loop and destroying stripe element');
    this.router.navigate([PublicAppRoutes.PURCHASE_CONFIRMATION]);
    this.store$.dispatch(new UserStoreActions.PurgeCartData()); // Remove cart data from store and local storage
  }

  private initializeStripeElement() {
    this.stripe = Stripe(this.stripePublishableKey);
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

    this.card.on('change', ({complete, error}) => {
      this.cardErrors = error && error.message; // Display card errors in real-time

      // Clears server response error message when new data is entered
      if (complete) {
        console.log('Purging stripe charge from store');
        this.store$.dispatch(new BillingStoreActions.PurgeStripeCharge());
      }
    });
  }

  private initializePaymentStatus() {
    this.paymentProcessing$ = this.store$.select(BillingStoreSelectors.selectPaymentProcessing);
    this.paymentResponse$ = this.store$.select(BillingStoreSelectors.selectStripeCharge);
  }

  ngOnDestroy() {
    // Destroy card when navigating away
    if (this.card) {
      console.log('Card destroyed');
      this.card.destroy();
    }
  }

}
