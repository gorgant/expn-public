import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UiService } from '../../../core/services/ui.service';
import { CONTACT_FORM_VARS, ContactForm, ContactFormKeys } from '../../../../../shared-models/user/contact-form.model';
import { PUBLIC_USER_VARS, PublicUserKeys } from '../../../../../shared-models/user/public-user.model';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProcessingSpinnerComponent } from '../../../shared/components/processing-spinner/processing-spinner.component';
import { GlobalFieldValues } from '../../../../../shared-models/content/string-vals.model';
import { ShorthandBusinessNames } from '../../../../../shared-models/meta/business-info.model';
import { Observable, Subscription, catchError, filter, map, switchMap, tap, throwError, withLatestFrom } from 'rxjs';
import { UserStoreActions, UserStoreSelectors } from '../../../root-store';
import { EmailOptInSource } from '../../../../../shared-models/email/email-opt-in-source.model';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LOCAL_STORAGE_SUBSCRIBER_DATA_KEY, SubscriberData } from '../../../../../shared-models/email/subscriber-data.model';
import { HelperService } from '../../../core/services/helpers.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [AsyncPipe, MatButtonModule, ProcessingSpinnerComponent,ReactiveFormsModule, MatFormFieldModule, MatInputModule, CdkTextareaAutosize, MatIconModule, MatCheckboxModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent implements OnInit {

  CONTACT_FORM_TITLE = GlobalFieldValues.CONTACT_FORM;
  EMAIL_FIELD_VALUE = GlobalFieldValues.EMAIL;
  FIRST_NAME_FIELD_VALUE = GlobalFieldValues.FIRST_NAME;
  MESSAGE_FIELD_VALUE = GlobalFieldValues.MESSAGE;
  OPT_IN_FIELD_VALUE = GlobalFieldValues.OPT_IN_BLURB + ' ' + ShorthandBusinessNames.EXPN;
  SUBMIT_BUTTON_VALUE = GlobalFieldValues.SUBMIT;

  EMAIL_MAX_LENGTH = PUBLIC_USER_VARS.emailMaxLength;
  EMAIL_MIN_LENGTH = PUBLIC_USER_VARS.emailMinLength;
  FIRST_NAME_MAX_LENGTH = PUBLIC_USER_VARS.firstNameMaxLength;
  FIRST_NAME_MIN_LENGTH = PUBLIC_USER_VARS.firstNameMinLength;
  MESSAGE_MAX_LENGTH = CONTACT_FORM_VARS.messageMaxLength;
  MESSAGE_MIN_LENGTH = CONTACT_FORM_VARS.messageMinLength;

  private $processContactFormCycleComplete = signal(false);
  private $processContactFormCycleInit = signal(false);
  private $processContactFormSubmitted = signal(false);
  private processContactFormError$!: Observable<{} | null>;
  processContactFormProcessing$!: Observable<boolean>;
  private processContactFormSubscription!: Subscription;

  userSubmittedForm$!: Observable<boolean>;
  $contactFormSubmissionAllowed = signal(true);

  private fb = inject(FormBuilder);
  private helperService = inject(HelperService)
  private store$ = inject(Store);
  private uiService = inject(UiService);

  contactForm = this.fb.group({
    [PublicUserKeys.EMAIL]: ['', [Validators.required, Validators.email, Validators.minLength(this.EMAIL_MIN_LENGTH), Validators.maxLength(this.EMAIL_MAX_LENGTH)]],
    [PublicUserKeys.FIRST_NAME]: ['', [Validators.required, Validators.minLength(this.FIRST_NAME_MIN_LENGTH), Validators.maxLength(this.FIRST_NAME_MAX_LENGTH)]],
    [ContactFormKeys.MESSAGE]: ['', [Validators.required, Validators.minLength(this.MESSAGE_MIN_LENGTH), Validators.maxLength(this.MESSAGE_MAX_LENGTH)]],
    [ContactFormKeys.OPT_IN]: [true]
  });

  ngOnInit(): void {
    this.monitorProcesses();
  }

  private monitorProcesses() {
    this.processContactFormError$ = this.store$.select(UserStoreSelectors.selectProcessContactFormError);
    this.processContactFormProcessing$ = this.store$.select(UserStoreSelectors.selectProcessContactFormProcessing);
    
    this.userSubmittedForm$ = this.store$.select(UserStoreSelectors.selectUserSubmittedForm);
  }

  get emailErrorMessage() {
    let errorMessage = '';
    if (this.email.hasError('required')) {
      return errorMessage = 'You must enter a value';
    }
    if (this.email.hasError('email')) {
      return errorMessage =  'Not a valid email.';
    }
    if (this.email.hasError('maxLength')) {
      return errorMessage = `Email cannot exceed ${this.MESSAGE_MAX_LENGTH} characters`;
    }
    if (this.email.hasError('minLength')) {
      return errorMessage = `Email must be at least ${this.MESSAGE_MIN_LENGTH} characters`;
    }
    return errorMessage;
  }

  get firstNameErrorMessage() {
    let errorMessage = '';
    if (this.firstName.hasError('required')) {
      return errorMessage = 'You must enter a value';
    }
    if (this.firstName.hasError('maxLength')) {
      return errorMessage = `Length cannot exceed ${this.FIRST_NAME_MAX_LENGTH} characters`;
    }
    if (this.firstName.hasError('minLength')) {
      return errorMessage = `Length must be at least ${this.FIRST_NAME_MIN_LENGTH} characters`;
    }
    return errorMessage;
  }

  get messageErrorMessage() {
    let errorMessage = '';
    if (this.message.hasError('required')) {
      return errorMessage = 'You must enter a value';
    }
    if (this.message.hasError('maxLength')) {
      return errorMessage = `Length cannot exceed ${this.MESSAGE_MAX_LENGTH} characters`;
    }
    if (this.message.hasError('minLength')) {
      return errorMessage = `Length must be at least ${this.MESSAGE_MIN_LENGTH} characters`;
    }
    return errorMessage;
  }

  onProcessContactForm() {
    if (!this.contactForm.dirty || !this.contactForm.touched) {
      this.uiService.showSnackBar(`You must complete the form to proceed!`, 7000);
      return;
    }
    if (!this.$contactFormSubmissionAllowed()) {
      this.uiService.showSnackBar(`You've already contacted us!`, 7000);
      return;
    }

    const subscriberData: SubscriberData = {
      [PublicUserKeys.EMAIL]: this.email.value.toLocaleLowerCase().trim(),
      [PublicUserKeys.FIRST_NAME]: this.firstName.value.trim(),
      [PublicUserKeys.EMAIL_OPT_IN_SOURCE]: EmailOptInSource.CONTACT_FORM
    };

    this.contactForm.disable();
    this.processContactFormSubscription = this.processContactFormError$
      .pipe(
        map(processingError => {
          if (processingError) {
            console.log('processingError detected, terminating pipe');
            this.resetProcessContactFormComponentState();
          }
          return processingError;
        }),
        withLatestFrom(this.userSubmittedForm$),
        filter(([processingError, userSubmittedForm]) => {
          if (userSubmittedForm) {
            this.uiService.showSnackBar(`You've already contacted us!`, 7000);
          }
          return !processingError && !userSubmittedForm
        }),
        switchMap(processingError => {
          if (!this.$processContactFormSubmitted()) {
            this.$processContactFormSubmitted.set(true);

            const contactFormData: ContactForm = {
              [ContactFormKeys.MESSAGE]: this.message.value.trim(),
              [ContactFormKeys.OPT_IN]: this.optIn.value,
              [ContactFormKeys.SUBSCRIBER_DATA]: subscriberData
            };

            this.store$.dispatch(UserStoreActions.processContactFormRequested({contactForm: contactFormData}));
          }
          return this.processContactFormProcessing$;
        }),
        // This tap/filter pattern ensures an async action has completed before proceeding with the pipe
        tap(createProcessing => {
          if (createProcessing) {
            console.log('contactForm creation processing');
            this.$processContactFormCycleInit.set(true);
          }
          if (!createProcessing && this.$processContactFormCycleInit()) {
            console.log('processContactForm successful, proceeding with pipe.');
            this.$processContactFormCycleInit.set(false);
            this.$processContactFormCycleComplete.set(true);
            if (this.optIn.value) {
              this.setSubscriptionStatusInLocalStorage(subscriberData);
            }
          }
        }),
        filter(createProcessing => !createProcessing && this.$processContactFormCycleComplete()),
        tap(createProcessing => {
          this.processContactFormSubscription?.unsubscribe();
          this.$contactFormSubmissionAllowed.set(false);
          this.uiService.showSnackBar(`ContactForm created!`, 5000);
        }),
        // Catch any local errors
        catchError(error => {
          console.log('Error in component:', error);
          this.uiService.showSnackBar(`Something went wrong. Please try again.`, 7000);
          this.resetProcessContactFormComponentState();
          return throwError(() => new Error(error));
        })
      ).subscribe();
  }

  private resetProcessContactFormComponentState() {
    this.processContactFormSubscription?.unsubscribe();
    this.$processContactFormSubmitted.set(false);
    this.$processContactFormCycleInit.set(false);
    this.$processContactFormCycleComplete.set(false);
    this.$contactFormSubmissionAllowed.set(true);
    this.store$.dispatch(UserStoreActions.purgeUserStateErrors());
    this.contactForm.enable();
  }

  private setSubscriptionStatusInLocalStorage(subscriberData: SubscriberData) {
    this.helperService.setLocalStorageItem(LOCAL_STORAGE_SUBSCRIBER_DATA_KEY, subscriberData);
  }

  get email() { return this.contactForm.get(PublicUserKeys.EMAIL) as FormControl<string>; }
  get firstName() { return this.contactForm.get(PublicUserKeys.FIRST_NAME) as FormControl<string>; }
  get message() { return this.contactForm.get(ContactFormKeys.MESSAGE) as FormControl<string>; }
  get optIn() { return this.contactForm.get(ContactFormKeys.OPT_IN) as FormControl<boolean>; }

}
