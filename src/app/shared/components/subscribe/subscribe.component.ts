import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SUBSCRIBE_VALIDATION_MESSAGES } from '../../../core/models/forms-and-components/validation-messages.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreActions, UserStoreSelectors, AuthStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { PublicUser } from 'src/app/core/models/user/public-user.model';
import { withLatestFrom, map, takeWhile } from 'rxjs/operators';
import { SubscriptionSource } from 'src/app/core/models/subscribers/subscription-source.model';
import { EmailSubData } from 'src/app/core/models/subscribers/email-sub-data.model';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {

  subscribeForm: FormGroup;
  formValidationMessages = SUBSCRIBE_VALIDATION_MESSAGES;

  subscribeProcessing$: Observable<boolean>;
  subscribeSubmitted$: Observable<boolean>;
  private emailSubmitted: boolean;

  private userAuthenticationRequested: boolean;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.subscribeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.initializeSubscribeObservers(); // Used to disable subscribe buttons
  }

  onSubmit() {

    // Fetch user or create a new one if not yet authenticated
    this.initializePublicUser()
      .pipe(
        takeWhile(() => !this.emailSubmitted)
      )
      .subscribe(user => {
        console.log('Checking for user to subscribe', user);
        if (user) {
          // Update the user's email address (or add to a new billing details object)
          const updatedUser: PublicUser = {
            ...user,
            billingDetails: user.billingDetails ? {
              ...user.billingDetails,
              email: this.email.value
            } : {
              email: this.email.value
            }
          };

          console.log('Subscribe email submitted', updatedUser);

          // Update user record
          this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));

          // Submit subscriber data to admin
          const emailSubData: EmailSubData = {
            user: updatedUser,
            subSource: SubscriptionSource.WEBSITE_BOX
          };
          this.store$.dispatch(new UserStoreActions.SubscribeUserRequested({emailSubData}));

          // Mark email submitted to close the subscription
          this.emailSubmitted = true;
        }
      });
  }

  private initializePublicUser() {
    return this.store$.select(UserStoreSelectors.selectUser)
      .pipe(
        withLatestFrom(
          this.store$.select(UserStoreSelectors.selectUserLoaded)
        ),
        map(([user, userLoaded]) => {
          if (!userLoaded && !this.userAuthenticationRequested) {
            console.log('No user in store, dispatching authentication request');
            this.store$.dispatch(new AuthStoreActions.AuthenticationRequested());
          }
          this.userAuthenticationRequested = true; // Prevents auth from firing multiple times
          return user;
        })
      );
  }

  private initializeSubscribeObservers() {
    this.subscribeProcessing$ = this.store$.select(UserStoreSelectors.selectSubscribeProcessing);
    this.subscribeSubmitted$ = this.store$.select(UserStoreSelectors.selectSubscribeSubmitted);
  }

  // These getters are used for easy access in the HTML template
  get email() { return this.subscribeForm.get('email'); }

}
