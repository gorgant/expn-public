import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmailSenderAddresses } from 'shared-models/email/email-vars.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors } from 'src/app/root-store';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-sub-progress-tracker',
  templateUrl: './sub-progress-tracker.component.html',
  styleUrls: ['./sub-progress-tracker.component.scss']
})
export class SubProgressTrackerComponent implements OnInit, OnDestroy {

  userSubscription: Subscription;
  userOptedIn: boolean;

  senderEmail: string = EmailSenderAddresses.EXPN_NEWSLETTER;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.monitorUserOptInStatus();
  }

  private monitorUserOptInStatus() {
    this.userSubscription = this.store$.select(UserStoreSelectors.selectUser)
      .pipe(takeWhile(() => !this.userOptedIn))
      .subscribe(user => {
        if (user.optInConfirmed) {
          this.userOptedIn = true;
          console.log('User opted in');
        }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
