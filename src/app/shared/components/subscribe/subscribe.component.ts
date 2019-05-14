import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SUBSCRIBE_VALIDATION_MESSAGES } from '../../../core/models/forms-and-components/validation-messages.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreActions, UserStoreSelectors, AuthStoreActions } from 'src/app/root-store';
import { Observable } from 'rxjs';
import { AnonymousUser } from 'src/app/core/models/user/anonymous-user.model';
import { withLatestFrom, map, take, takeUntil, takeWhile } from 'rxjs/operators';
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
  emailSubmitted;

  userAuthenticationRequested: boolean;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.subscribeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private initializeAnonymousUser() {
    return this.store$.select(UserStoreSelectors.selectAppUser)
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

  onSubmit() {

    // Fetch user or create a new one if not yet authenticated
    this.initializeAnonymousUser()
      .pipe(
        takeWhile(() => !this.emailSubmitted)
      )
      .subscribe(user => {
        console.log('Checking for user to subscribe', user);
        if (user) {
          // Update the user's email address (or add to a new billing details object)
          const updatedUser: AnonymousUser = {
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

          // TODO: SET EMAIL SUBMITTED IN STORE SO THAT IT IS DISABLED ACROSS THE APP

          // Mark email submitted
          this.emailSubmitted = true;
        }
      });
  }

  // These getters are used for easy access in the HTML template
  get email() { return this.subscribeForm.get('email'); }

}
