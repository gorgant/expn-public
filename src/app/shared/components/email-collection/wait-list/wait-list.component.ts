import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SUBSCRIBE_VALIDATION_MESSAGES } from 'shared-models/forms-and-components/public-validation-messages.model';
import { Observable, Subscription } from 'rxjs';
import { EmailSenderAddresses } from 'shared-models/email/email-vars.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, UserStoreActions } from 'src/app/root-store';
import { BillingKeys } from 'shared-models/billing/billing-details.model';
import { take, withLatestFrom } from 'rxjs/operators';
import { PublicUser } from 'shared-models/user/public-user.model';
import { EmailSubData } from 'shared-models/subscribers/email-sub-data.model';
import { SubscriptionSource } from 'shared-models/subscribers/subscription-source.model';
import { SubSourceProductIdReferences } from 'shared-models/products/product-id-list.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SubProgressTrackerComponent } from '../sub-progress-tracker/sub-progress-tracker.component';
import { metaTagsContentPages } from 'shared-models/analytics/metatags.model';
import { forbiddenEmailValidator, forbiddenNameValidator } from 'src/app/shared/validators/forbidden-sub-vars.validator';

@Component({
  selector: 'app-wait-list',
  templateUrl: './wait-list.component.html',
  styleUrls: ['./wait-list.component.scss']
})
export class WaitListComponent implements OnInit, OnDestroy {

  @Input() productId: string;
  subscriptionSource: SubscriptionSource;

  subscribeForm: FormGroup;
  formValidationMessages = SUBSCRIBE_VALIDATION_MESSAGES;

  isSubscribingUser$: Observable<boolean>;
  subscribeUserError$: Observable<any>;
  userSubscribed: boolean;
  subscribeUserSubscription: Subscription;
  existingSubscriber: boolean;

  senderEmail: string = EmailSenderAddresses.EXPN_NEWSLETTER;

  boxDescription = metaTagsContentPages.expnPublic.waitListBoxDescription;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.assignSubscriptionSource();
    this.subscribeForm = this.fb.group({
      [BillingKeys.FIRST_NAME]: ['', [Validators.required, forbiddenNameValidator()]],
      [BillingKeys.EMAIL]: ['', [Validators.required, Validators.email, forbiddenEmailValidator()]]
    });

    this.initializeSubscribeObservers(); // Used to disable subscribe buttons
  }

  // Assign subscription source based on product id;
  private assignSubscriptionSource() {
    console.log('Using this product id to assign sub source', this.productId);
    this.subscriptionSource = SubSourceProductIdReferences[this.productId].subSource;
    // Exit function if no matching waitlist found
    if (!this.subscriptionSource) {
      console.log('No matching waitlist for product id, hiding list');
    }
  }

  onSubmit() {
    this.userSubscribed = false; // Reset this variable
    // Prevent submission if either field is blank (allows submit button to stay illuminated even when blank)
    if (this[BillingKeys.EMAIL].value === '' || this[BillingKeys.FIRST_NAME].value === '') {
      return;
    }

    this.store$.select(UserStoreSelectors.selectUser) // User initialized in app component
      .pipe(
        take(1),
        withLatestFrom(this.store$.select(UserStoreSelectors.selectSubscribeUserComplete))
      )
      .subscribe(([user, userSubscribedThisSession]) => {
        console.log('Checking for user to subscribe', user);

        // If no user, do nothing
        if (!user) {
          console.log('Error processing subscription, no user available');
          return;
        }

        // If user already submitted a subscribe this session, prevent additional subs
        if (userSubscribedThisSession) {
          console.log('Error processing subscription, user already successfully submitted a subscribe request.');
          return;
        }

        // If user, submit data to admin
        if (user) {

          // If user already subscribed, modify response
          if (user.optInConfirmed && user.billingDetails.email === this[BillingKeys.EMAIL].value.trim().toLocaleLowerCase()) {
            this.existingSubscriber = true;
            // Continue function because this is separate from primary newsletter
          }
          // Update the user's name and email address (or add to a new billing details object)
          const updatedUser: PublicUser = {
            ...user,
            billingDetails: user.billingDetails ? {
              ...user.billingDetails,
              [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim().toLocaleLowerCase()
            } : {
              [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim().toLocaleLowerCase()
            }
          };

          // Update user record
          this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));

          // Submit subscriber data to admin
          const emailSubData: EmailSubData = {
            user: updatedUser,
            subSource: this.subscriptionSource
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
          this.popSubProgressTracker(); // Pop sub progress tracker if submission succeeded
          this.subscribeUserSubscription.unsubscribe();
        }
        if (subscribeError) {
          console.log('Error subscribing user');
          this.userSubscribed = false;
          this.subscribeUserSubscription.unsubscribe();
        }
      });
  }

  private initializeSubscribeObservers() {
    this.isSubscribingUser$ = this.store$.select(UserStoreSelectors.selectIsSubscribingUser);
    this.subscribeUserError$ = this.store$.select(UserStoreSelectors.selectSubscribeUserError);
  }

  private popSubProgressTracker() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = 300;
    dialogConfig.maxWidth = 600;
    this.dialog.open(SubProgressTrackerComponent, dialogConfig);
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
