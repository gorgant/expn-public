import { Component, OnInit, inject, signal } from '@angular/core';
import { GlobalFieldValues, SiteSpecificFieldValues } from '../../../../../../shared-models/content/string-vals.model';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiService } from '../../../../core/services/ui.service';
import { PUBLIC_USER_VARS, PublicUserKeys } from '../../../../../../shared-models/user/public-user.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable, Subscription, catchError, filter, map, switchMap, tap, throwError, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserStoreActions, UserStoreSelectors } from '../../../../root-store';
import { EmailOptInSource } from '../../../../../../shared-models/email/email-opt-in-source.model';
import { AsyncPipe } from '@angular/common';
import { ProcessingSpinnerComponent } from '../../processing-spinner/processing-spinner.component';
import { EMPTY_SPINNER_MESSAGE } from '../../../../../../shared-models/user-interface/dialogue-box-default-config.model';
import { HelperService } from '../../../../core/services/helpers.service';
import { LOCAL_STORAGE_SUBSCRIBER_DATA_KEY, SubscriberData } from '../../../../../../shared-models/email/subscriber-data.model';

@Component({
  selector: 'app-subscribe-box',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, AsyncPipe, ProcessingSpinnerComponent],
  templateUrl: './subscribe-box.component.html',
  styleUrl: './subscribe-box.component.scss'
})
export class SubscribeBoxComponent implements OnInit {

  EMAIL_FIELD_VALUE = GlobalFieldValues.EMAIL;
  FIRST_NAME_FIELD_VALUE = GlobalFieldValues.FIRST_NAME;
  SUBMIT_BUTTON_VALUE = GlobalFieldValues.SUBMIT;

  EMAIL_MAX_LENGTH = PUBLIC_USER_VARS.emailMaxLength;
  EMAIL_MIN_LENGTH = PUBLIC_USER_VARS.emailMinLength;
  FIRST_NAME_MAX_LENGTH = PUBLIC_USER_VARS.firstNameMaxLength;
  FIRST_NAME_MIN_LENGTH = PUBLIC_USER_VARS.firstNameMinLength;

  TITLE_TEXT = SiteSpecificFieldValues.expnPublic.subscribeBoxTitle;
  SUBTITLE_TEXT = SiteSpecificFieldValues.expnPublic.subscribeBoxSubtitle;
  
  EMPTY_SPINNER_MESSAGE = EMPTY_SPINNER_MESSAGE;
  
  private $processSubscriptionFormCycleComplete = signal(false);
  private $processSubscriptionFormCycleInit = signal(false);
  private $processSubscriptionFormSubmitted = signal(false);
  private processSubscriptionFormError$!: Observable<{} | null>;
  processSubscriptionFormProcessing$!: Observable<boolean>;
  private processSubscriptionFormSubscription!: Subscription;

  userSubmittedForm$!: Observable<boolean>;
  $subscriptionFormSubmissionAllowed = signal(true);

  private fb = inject(FormBuilder);
  private store$ = inject(Store);
  private uiService = inject(UiService);
  private helperService = inject(HelperService);
  

  ngOnInit(): void {
    this.monitorProcesses();
  }

  private monitorProcesses() {
    this.processSubscriptionFormError$ = this.store$.select(UserStoreSelectors.selectProcessSubscriptionFormError);
    this.processSubscriptionFormProcessing$ = this.store$.select(UserStoreSelectors.selectProcessSubscriptionFormProcessing);

    this.userSubmittedForm$ = this.store$.select(UserStoreSelectors.selectUserSubmittedForm);
  }

  subscriptionForm = this.fb.group({
    [PublicUserKeys.EMAIL]: ['', [Validators.required, Validators.email, Validators.minLength(this.EMAIL_MIN_LENGTH), Validators.maxLength(this.EMAIL_MAX_LENGTH)]],
    [PublicUserKeys.FIRST_NAME]: ['', [Validators.required, Validators.minLength(this.FIRST_NAME_MIN_LENGTH), Validators.maxLength(this.FIRST_NAME_MAX_LENGTH)]],
  });

  get firstNameErrorMessage() {
    let errorMessage = '';
    if (this.firstName.hasError('required')) {
      return errorMessage = 'You must enter a value';
    }
    return errorMessage;
  }

  get emailErrorMessage() {
    let errorMessage = '';
    if (this.email.hasError('required')) {
      return errorMessage = 'You must enter a value';
    }
    if (this.email.hasError('email')) {
      return errorMessage =  'Not a valid email.';
    }
    return errorMessage;
  }

  onProcessSubscriptionForm() {
    if (!this.subscriptionForm.dirty || !this.subscriptionForm.touched) {
      this.uiService.showSnackBar(`You must complete the form to proceed!`, 7000);
      return;
    }
    if (!this.$subscriptionFormSubmissionAllowed()) {
      this.uiService.showSnackBar(`You've already subscribed!`, 7000);
      return;
    }

    const subscriberData: SubscriberData = {
      [PublicUserKeys.EMAIL]: this.email.value.toLocaleLowerCase().trim(),
      [PublicUserKeys.FIRST_NAME]: this.firstName.value.trim(),
      [PublicUserKeys.EMAIL_OPT_IN_SOURCE]: EmailOptInSource.WEBSITE_SUBSCRIBE_BOX
    };

    this.subscriptionForm.disable();
    this.processSubscriptionFormSubscription = this.processSubscriptionFormError$
      .pipe(
        map(processingError => {
          if (processingError) {
            console.log('processingError detected, terminating pipe');
            this.resetProcessSubscriptionFormComponentState();
          }
          return processingError;
        }),
        withLatestFrom(this.userSubmittedForm$),
        filter(([processingError, userSubmittedForm]) => {
          if (userSubmittedForm) {
            this.uiService.showSnackBar(`You've already subscribed!`, 7000);
          }
          return !processingError && !userSubmittedForm
        }),
        switchMap(processingError => {
          if (!this.$processSubscriptionFormSubmitted()) {
            this.$processSubscriptionFormSubmitted.set(true);
            this.store$.dispatch(UserStoreActions.processSubscriptionFormRequested({subscriberData}));
          }
          return this.processSubscriptionFormProcessing$;
        }),
        // This tap/filter pattern ensures an async action has completed before proceeding with the pipe
        tap(createProcessing => {
          if (createProcessing) {
            console.log('subscriptionForm creation processing');
            this.$processSubscriptionFormCycleInit.set(true);
          }
          if (!createProcessing && this.$processSubscriptionFormCycleInit()) {
            console.log('processSubscriptionForm successful, proceeding with pipe.');
            this.$processSubscriptionFormCycleInit.set(false);
            this.$processSubscriptionFormCycleComplete.set(true);
          }
        }),
        filter(createProcessing => !createProcessing && this.$processSubscriptionFormCycleComplete()),
        tap(createProcessing => {
          this.processSubscriptionFormSubscription?.unsubscribe();
          this.$subscriptionFormSubmissionAllowed.set(false);
          this.setSubscriptionStatusInLocalStorage(subscriberData);
          this.uiService.showSnackBar(`Check your inbox to confirm your subscription!`, 30000);
        }),
        // Catch any local errors
        catchError(error => {
          console.log('Error in component:', error);
          this.uiService.showSnackBar(`Something went wrong. Please try again.`, 7000);
          this.resetProcessSubscriptionFormComponentState();
          return throwError(() => new Error(error));
        })
      ).subscribe();
  }

  private resetProcessSubscriptionFormComponentState() {
    this.processSubscriptionFormSubscription?.unsubscribe();
    this.$processSubscriptionFormSubmitted.set(false);
    this.$processSubscriptionFormCycleInit.set(false);
    this.$processSubscriptionFormCycleComplete.set(false);
    this.$subscriptionFormSubmissionAllowed.set(true);
    this.store$.dispatch(UserStoreActions.purgeUserStateErrors());
    this.subscriptionForm.enable();
  }

  private setSubscriptionStatusInLocalStorage(subscriberData: SubscriberData) {
    this.helperService.setLocalStorageItem(LOCAL_STORAGE_SUBSCRIBER_DATA_KEY, subscriberData);
  }

  get firstName() { return this.subscriptionForm.get(PublicUserKeys.FIRST_NAME) as FormControl<string>; }
  get email() { return this.subscriptionForm.get(PublicUserKeys.EMAIL) as FormControl<string>; }

}
