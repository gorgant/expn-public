import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FirebaseError } from 'firebase/app';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlobalFieldValues } from '../../../shared-models/content/string-vals.model';
import { EmailSenderAddresses } from '../../../shared-models/email/email-vars.model';
import { EmailVerificationUrlParamKeys, EmailVerificationData } from '../../../shared-models/email/email-verification-data';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';
import { UserStoreSelectors, UserStoreActions } from '../root-store';
import { ProcessingSpinnerComponent } from "../shared/components/processing-spinner/processing-spinner.component";
import { UiService } from '../core/services/ui.service';

@Component({
    selector: 'app-email-verification',
    templateUrl: './email-verification.component.html',
    styleUrls: ['./email-verification.component.scss'],
    standalone: true,
    imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule, AsyncPipe, ProcessingSpinnerComponent]
})
export class EmailVerificationComponent implements OnInit {

  CONFIRMING_EMAIL_BLURB = GlobalFieldValues.CONFIRMING_EMAIL;
  VERIFICATION_FAILED_BLURB = GlobalFieldValues.VERIFICATION_FAILED;
  EMAIL_CONFIRMED_BLURB = GlobalFieldValues.EMAIL_CONFIRMED;
  SUPPORT_EMAIL = EmailSenderAddresses.EXPN_SUPPORT;

  verifyEmailSucceeded$!: Observable<boolean>;
  verifyEmailProcessing$!: Observable<boolean>;
  verifyEmailError$!: Observable<FirebaseError | Error | null>;

  dispatchedEmailVerificationRequest = false;

  private store$ = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private uiService = inject(UiService);

  constructor() { }

  ngOnInit() {
    this.monitorStoreState();
    this.verifyUserEmail();
  }

  private monitorStoreState() {
    this.verifyEmailSucceeded$ = this.store$.select(UserStoreSelectors.selectVerifyEmailSucceeded);
    this.verifyEmailProcessing$ = this.store$.select(UserStoreSelectors.selectVerifyEmailProcessing);
    this.verifyEmailError$ = this.store$.select(UserStoreSelectors.selectVerifyEmailError);
  }

  private verifyUserEmail() {
    if (this.uiService.$isServerPlatform()) {
      console.log('Server platform detected, canceling verification operation');
      return;
    }
    console.log('Initiating user email verification process');
    
    // Check if id params are available
    const userIdParamKey = EmailVerificationUrlParamKeys.USER_ID;
    const emailParamKey = EmailVerificationUrlParamKeys.EMAIL;
    const isEmailUpdateParamKey = EmailVerificationUrlParamKeys.IS_EMAIL_UPDATE;

    const email: string = this.route.snapshot.queryParams[emailParamKey];
    const userId: string = this.route.snapshot.queryParams[userIdParamKey];
    const isEmailUpdate: boolean = this.route.snapshot.queryParams[isEmailUpdateParamKey];

    if (!isEmailUpdate) {
      const emailVerificationData: EmailVerificationData = { userId, email };
      console.log(`verifying user ${userId} with email:`, emailVerificationData.email);
      this.store$.dispatch(UserStoreActions.verifyEmailRequested({emailVerificationData}));
    }
  }

  onEnterApp() {
    this.router.navigate([PublicAppRoutes.HOME]);
  }

  ngOnDestroy() {
  }

}
