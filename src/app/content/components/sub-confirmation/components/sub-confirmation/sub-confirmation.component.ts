import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors, UserStoreActions } from 'src/app/root-store';
import { EmailSenderAddresses } from 'shared-models/email/email-vars.model';
import { SubOptInConfirmationData } from 'shared-models/subscribers/sub-opt-in-confirmation-data.model';
import { isPlatformServer } from '@angular/common';
import { withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-confirmation',
  templateUrl: './sub-confirmation.component.html',
  styleUrls: ['./sub-confirmation.component.scss']
})
export class SubConfirmationComponent implements OnInit, OnDestroy {

  confirmSubscriberProcessing$: Observable<boolean>;
  confirmSubcriberError$: Observable<any>;
  confirmSubOptInSubscription: Subscription;
  subMarkedConfirmed: boolean;

  supportEmail = EmailSenderAddresses.EXPLEARNING_SUPPORT;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  ngOnInit() {
    // Only run on client
    if (!isPlatformServer(this.platformId)) {
      this.initializeSubConfirmationStatus();
      this.markSubscriberConfirmed();
    }
  }

  private initializeSubConfirmationStatus() {
    this.confirmSubscriberProcessing$ = this.store$.select(UserStoreSelectors.selectIsConfirmingSubOptIn);
    this.confirmSubcriberError$ = this.store$.select(UserStoreSelectors.selectConfirmSubOptInError);
  }

  private markSubscriberConfirmed() {
    // Check if id params are available
    const subIdParamName = 'subId';
    const pubIdParamName = 'pubId';
    const subscriberId = this.route.snapshot.params[subIdParamName];
    const publicId = this.route.snapshot.params[pubIdParamName];

    if (subscriberId && pubIdParamName) {

      const subConfData: SubOptInConfirmationData = {
        subscriberId,
        publicId
      };

      this.store$.dispatch(new UserStoreActions.ConfirmSubOptInRequested({subConfData}));
      console.log('marking subscriber confirmed with this id data', subConfData);
      this.reactToConfirmSubOptInOutcome();
    }
  }

  private reactToConfirmSubOptInOutcome() {
    this.confirmSubOptInSubscription = this.store$.select(UserStoreSelectors.selectIsConfirmingSubOptIn)
      .pipe(
        withLatestFrom(
          this.store$.select(UserStoreSelectors.selectConfirmSubOptInError)
        )
      )
      .subscribe(([isConfirmingOptIn, optInError]) => {
        if (!isConfirmingOptIn && !optInError) {
          console.log('Sub marked confirmed');
          this.subMarkedConfirmed = true;
          this.confirmSubOptInSubscription.unsubscribe();
        }
        if (optInError) {
          console.log('Error marking sub confirmed');
          this.subMarkedConfirmed = false;
          this.confirmSubOptInSubscription.unsubscribe();
        }
      });
  }

  ngOnDestroy() {
    if (this.confirmSubOptInSubscription) {
      this.confirmSubOptInSubscription.unsubscribe();
    }
  }

}
