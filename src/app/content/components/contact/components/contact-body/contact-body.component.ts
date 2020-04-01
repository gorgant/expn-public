import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, AuthStoreActions, UserStoreActions } from 'src/app/root-store';
import { withLatestFrom, map, takeWhile } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { now } from 'moment';
import { CONTACT_VALIDATION_MESSAGES } from 'shared-models/forms-and-components/public-validation-messages.model';
import { PublicUser } from 'shared-models/user/public-user.model';
import { EmailSubData } from 'shared-models/subscribers/email-sub-data.model';
import { SubscriptionSource } from 'shared-models/subscribers/subscription-source.model';
import { ContactForm, ContactFormKeys } from 'shared-models/user/contact-form.model';
import { BillingKeys } from 'shared-models/billing/billing-details.model';

@Component({
  selector: 'app-contact-body',
  templateUrl: './contact-body.component.html',
  styleUrls: ['./contact-body.component.scss']
})
export class ContactBodyComponent implements OnInit {

  contactForm: FormGroup;
  formValidationMessages = CONTACT_VALIDATION_MESSAGES;
  formSubmitted: boolean;

  private userAuthenticationRequested: boolean;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
    private afs: AngularFirestore // Used exclusively to generate an id
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      [BillingKeys.FIRST_NAME]: ['', [Validators.required]],
      [BillingKeys.EMAIL]: ['', [Validators.required, Validators.email]],
      [ContactFormKeys.MESSAGE]: ['', [Validators.required]]
    });
  }

  onSubmit() {
    console.log('Contact form submitted', this.contactForm.value);

    // Fetch user or create a new one if not yet authenticated
    this.initializePublicUser()
      .pipe(
        takeWhile(() => !this.formSubmitted)
      )
      .subscribe(user => {
        console.log('Checking for user to subscribe', user);
        if (user) {
          const existingFirstName = user.stripeCustomerId && user.billingDetails[BillingKeys.FIRST_NAME];
          // Update the user's name and email address (or add to a new billing details object)
          const updatedUser: PublicUser = {
            ...user,
            billingDetails: user.billingDetails ? {
              ...user.billingDetails,
              // tslint:disable-next-line:max-line-length
              [BillingKeys.FIRST_NAME]: (existingFirstName ? existingFirstName : this[BillingKeys.FIRST_NAME].value as string).trim(), // Use exstng val if order history
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim()
            } : {
              [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim()
            }
          };

          console.log('Subscribe email submitted', updatedUser);

          // Update user record
          this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));

          // Submit subscriber data to admin
          const emailSubData: EmailSubData = {
            user: updatedUser,
            subSource: SubscriptionSource.CONTACT_FORM
          };
          this.store$.dispatch(new UserStoreActions.SubscribeUserRequested({emailSubData}));

          // Submit form data to admin
          const contactFormData: ContactForm = {
            id: this.afs.createId(),
            createdDate: now(),
            [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
            [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim(),
            [ContactFormKeys.MESSAGE]: this[ContactFormKeys.MESSAGE].value,
            publicUser: user
          };
          this.store$.dispatch(new UserStoreActions.TransmitContactFormRequested({contactForm: contactFormData}));

          // Mark form submitted to close the subscription
          this.formSubmitted = true;
        }
      });
  }

  // This handles a weird error related to lastpass form detection when pressing enter
  // From: https://github.com/KillerCodeMonkey/ngx-quill/issues/351#issuecomment-476017960
  textareaEnterPressed($event: KeyboardEvent) {
    $event.preventDefault();
    $event.stopPropagation();
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

  // These getters are used for easy access in the HTML template
  get [BillingKeys.FIRST_NAME]() { return this.contactForm.get(BillingKeys.FIRST_NAME); }
  get [BillingKeys.EMAIL]() { return this.contactForm.get(BillingKeys.EMAIL); }
  get [ContactFormKeys.MESSAGE]() { return this.contactForm.get(ContactFormKeys.MESSAGE); }

}
