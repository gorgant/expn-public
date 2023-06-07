import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, UserStoreActions } from 'src/app/root-store';
import { withLatestFrom, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { now } from 'moment';
import { CONTACT_VALIDATION_MESSAGES } from 'shared-models/forms-and-components/public-validation-messages.model';
import { PublicUser } from 'shared-models/user/public-user.model';
import { EmailSubData } from 'shared-models/subscribers/email-sub-data.model';
import { SubscriptionSource } from 'shared-models/subscribers/subscription-source.model';
import { ContactForm, ContactFormKeys } from 'shared-models/user/contact-form.model';
import { BillingKeys } from 'shared-models/billing/billing-details.model';
import { Subscription, Observable } from 'rxjs';
import { ShorthandBusinessNames } from 'shared-models/forms-and-components/legal-vars.model';

@Component({
  selector: 'app-contact-body',
  templateUrl: './contact-body.component.html',
  styleUrls: ['./contact-body.component.scss']
})
export class ContactBodyComponent implements OnInit {

  contactForm: FormGroup;
  formValidationMessages = CONTACT_VALIDATION_MESSAGES;
  formSubmitted: boolean;

  isTransmittingContactForm$: Observable<boolean>;
  transmitContactFormError$: Observable<any>;
  contactFormSubmissionSubscription: Subscription;

  shorthandBusinessName = ShorthandBusinessNames.EXPN;

  constructor(
    private fb: FormBuilder,
    private store$: Store<RootStoreState.State>,
    private afs: AngularFirestore // Used exclusively to generate an id
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      [BillingKeys.FIRST_NAME]: ['', [Validators.required]],
      [BillingKeys.EMAIL]: ['', [Validators.required, Validators.email]],
      [ContactFormKeys.MESSAGE]: ['', [Validators.required]],
      [ContactFormKeys.OPT_IN]: [true]
    });
    this.initContactFormObservers();
  }

  onSubmit() {
    this.formSubmitted = false;
    console.log('Contact form submitted', this.contactForm.value);

    if (this[ContactFormKeys.MESSAGE].value === '') {
      console.log('Message blank, from not submitted');
      return;
    }

    // Fetch user or create a new one if not yet authenticated
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

        if (user) {
          const existingFirstName = user.stripeCustomerId && user.billingDetails[BillingKeys.FIRST_NAME];
          // Update the user's name and email address (or add to a new billing details object)
          const updatedUser: PublicUser = {
            ...user,
            billingDetails: user.billingDetails ? {
              ...user.billingDetails,
              // tslint:disable-next-line:max-line-length
              [BillingKeys.FIRST_NAME]: (existingFirstName ? existingFirstName : this[BillingKeys.FIRST_NAME].value as string).trim(), // Use exstng val if order history
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim().toLocaleLowerCase()
            } : {
              [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
              [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim().toLocaleLowerCase()
            }
          };

          console.log('Subscribe email submitted', updatedUser);

          // Update user record
          this.store$.dispatch(new UserStoreActions.StoreUserDataRequested({userData: updatedUser}));

          const emailSubData: EmailSubData = {
            user: updatedUser,
            subSource: SubscriptionSource.CONTACT_FORM
          };

          // Prevent subscription flow from triggering in admin if user opts out
          if (!this[ContactFormKeys.OPT_IN].value) {
            console.log('User opted out');
            // Submit subscriber data to admin
            emailSubData.subSource = SubscriptionSource.CONTACT_FORM_NO_SUB;
          }

          this.store$.dispatch(new UserStoreActions.SubscribeUserRequested({emailSubData}));

          // Submit form data to admin
          const contactFormData: ContactForm = {
            id: this.afs.createId(),
            createdDate: now(),
            [BillingKeys.FIRST_NAME]: (this[BillingKeys.FIRST_NAME].value as string).trim(),
            [BillingKeys.EMAIL]: (this[BillingKeys.EMAIL].value as string).trim().toLocaleLowerCase(),
            [ContactFormKeys.MESSAGE]: this[ContactFormKeys.MESSAGE].value,
            publicUser: user,
            [ContactFormKeys.OPT_IN]: this[ContactFormKeys.OPT_IN].value,
          };
          this.store$.dispatch(new UserStoreActions.TransmitContactFormRequested({contactForm: contactFormData}));

          this.reactToTransmitContactFormOutcome(contactFormData);
        }
      });
  }

  private reactToTransmitContactFormOutcome(contactForm: ContactForm) {
    this.contactFormSubmissionSubscription = this.store$.select(UserStoreSelectors.selectIsTransmittingContactForm)
    .pipe(
      withLatestFrom(
        this.store$.select(UserStoreSelectors.selectTransmitContactFormError)
      )
    )
    .subscribe(([isTransmittingContactForm, transmissionError]) => {
      if (!isTransmittingContactForm && !transmissionError) {
        console.log('Contact form transmitted', contactForm);
        this.formSubmitted = true;
        this.contactFormSubmissionSubscription.unsubscribe();
      }
      if (transmissionError) {
        console.log('Error transmitting contact form');
        this.formSubmitted = false;
        this.contactFormSubmissionSubscription.unsubscribe();
      }
    });
  }

  private initContactFormObservers() {
    this.isTransmittingContactForm$ = this.store$.select(UserStoreSelectors.selectIsTransmittingContactForm);
    this.transmitContactFormError$ = this.store$.select(UserStoreSelectors.selectTransmitContactFormError);
  }

  // This handles a weird error related to lastpass form detection when pressing enter
  // From: https://github.com/KillerCodeMonkey/ngx-quill/issues/351#issuecomment-476017960
  textareaEnterPressed($event: KeyboardEvent) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  // These getters are used for easy access in the HTML template
  get [BillingKeys.FIRST_NAME]() { return this.contactForm.get(BillingKeys.FIRST_NAME); }
  get [BillingKeys.EMAIL]() { return this.contactForm.get(BillingKeys.EMAIL); }
  get [ContactFormKeys.MESSAGE]() { return this.contactForm.get(ContactFormKeys.MESSAGE); }
  get [ContactFormKeys.OPT_IN]() { return this.contactForm.get(ContactFormKeys.OPT_IN); }

}
