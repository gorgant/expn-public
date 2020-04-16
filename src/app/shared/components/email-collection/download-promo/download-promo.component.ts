import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SUBSCRIBE_VALIDATION_MESSAGES } from 'shared-models/forms-and-components/public-validation-messages.model';
import { Observable, Subscription } from 'rxjs';
import { EmailSenderAddresses } from 'shared-models/email/email-vars.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, UserStoreActions } from 'src/app/root-store';
import { take, withLatestFrom } from 'rxjs/operators';
import { PublicUser } from 'shared-models/user/public-user.model';
import { EmailSubData } from 'shared-models/subscribers/email-sub-data.model';
import { SubscriptionSource } from 'shared-models/subscribers/subscription-source.model';
import { BillingKeys } from 'shared-models/billing/billing-details.model';

@Component({
  selector: 'app-download-promo',
  templateUrl: './download-promo.component.html',
  styleUrls: ['./download-promo.component.scss']
})
export class DownloadPromoComponent implements OnInit, OnDestroy {

  subscribeForm: FormGroup;
  formValidationMessages = SUBSCRIBE_VALIDATION_MESSAGES;

  isSubscribingUser$: Observable<boolean>;
  subscribeUserError$: Observable<any>;
  userSubscribed: boolean;
  subscribeUserSubscription: Subscription;
  existingSubscriber: boolean;

  senderEmail: string = EmailSenderAddresses.EXPLEARNING_NEWSLETTER;

  constructor(
    @Inject(MAT_DIALOG_DATA) public promoData: any,
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.subscribeForm = this.fb.group({
      [BillingKeys.FIRST_NAME]: ['', [Validators.required]],
      [BillingKeys.EMAIL]: ['', [Validators.required, Validators.email]]
    });

    this.initializeSubscribeObservers(); // Used to disable subscribe buttons
  }

  onSubmit() {
    this.userSubscribed = false; // Reset this variable
    // Prevent submission if either field is blank (allows submit button to stay illuminated even when blank)
    if (this[BillingKeys.EMAIL].value === '' || this[BillingKeys.FIRST_NAME].value === '') {
      return;
    }

    this.store$.select(UserStoreSelectors.selectUser) // User initialized in app component
      .pipe(
        take(1)
      )
      .subscribe(user => {
        console.log('Checking for user to subscribe', user);

        // If no user, do nothing
        if (!user) {
          console.log('Error processing subscription, no user available');
          return;
        }

        // If user, submit data to admin
        if (user) {

          // If user already subscribed, notify user and don't process
          if (user.optInConfirmed && user.billingDetails.email === this[BillingKeys.EMAIL].value) {
            this.existingSubscriber = true;
            this.userSubscribed = true;
            return;
          }
          // Update the user's name and email address (or add to a new billing details object)
          const updatedUser: PublicUser = {
            ...user,
            billingDetails: user.billingDetails ? {
              ...user.billingDetails,
              [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim()
            } : {
              [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim()
            }
          };

          // Update user record
          this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));

          // Submit subscriber data to admin
          const emailSubData: EmailSubData = {
            user: updatedUser,
            subSource: SubscriptionSource.POPUP_SMALLTALK
          };
          this.store$.dispatch(new UserStoreActions.SubscribeUserRequested({emailSubData}));

          this.reactToSubscribeUserOutcome(updatedUser);
        }
      });
  }

  private reactToSubscribeUserOutcome(updatedUser: PublicUser) {
    this.subscribeUserSubscription = this.store$.select(UserStoreSelectors.selectIsSubscribingUser)
      .pipe(
        withLatestFrom(
          this.store$.select(UserStoreSelectors.selectSubscribeUserError)
        )
      )
      .subscribe(([isSubscribingUser, subscribeError]) => {
        if (!isSubscribingUser && !subscribeError) {
          console.log('User subscribed', updatedUser);
          this.userSubscribed = true;
        }
        if (subscribeError) {
          console.log('Error subscribing user');
          this.userSubscribed = false;
        }
      });
  }

  private initializeSubscribeObservers() {
    this.isSubscribingUser$ = this.store$.select(UserStoreSelectors.selectIsSubscribingUser);
    this.subscribeUserError$ = this.store$.select(UserStoreSelectors.selectSubscribeUserError);
  }

  ngOnDestroy() {
    if (this.subscribeUserSubscription) {
      this.subscribeUserSubscription.unsubscribe();
    }
  }

  // These getters are used for easy access in the HTML template
  get [BillingKeys.FIRST_NAME]() { return this.subscribeForm.get(BillingKeys.FIRST_NAME); }
  get [BillingKeys.EMAIL]() { return this.subscribeForm.get(BillingKeys.EMAIL); }

}
