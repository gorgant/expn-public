import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './navigation/header/header.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { SidenavComponent } from './navigation/sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UiService } from './core/services/ui.service';
import { take, tap } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SubscribePopupDialogueComponent } from './shared/components/subscriptions/subscribe-popup-dialogue/subscribe-popup-dialogue.component';
import { HelperService } from './core/services/helpers.service';
import { LOCAL_STORAGE_SUBSCRIBER_DATA_KEY, PopupTriggerQueryParamKeys, SubscriberData } from '../../shared-models/email/subscriber-data.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, SidenavComponent, MatSidenavModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private $popupDisabled = signal(false);
  private MINIMUM_BROWSING_TIME_FOR_POPUP = 10 * 1000;

  private route = inject(ActivatedRoute);
  private dialogue = inject(MatDialog);
  private helperService = inject(HelperService);
  uiService = inject(UiService);

  ngOnInit(): void {
    this.uiService.configureAppCheck();
    this.initializePopup();
  }

  private initializePopup() {

    if (this.uiService.$isServerPlatform()) {
      console.log('serverPlatform detected, disabling popup');
      this.$popupDisabled.set(true);
      return;
    }

    // Disables the popup if subscriberData is in the local storage
    const subscriberData = this.helperService.getLocalStorageItem<SubscriberData>(LOCAL_STORAGE_SUBSCRIBER_DATA_KEY);
    if (subscriberData) {
      console.log('Existing subscriberData detected, disabling popup', subscriberData);
      this.$popupDisabled.set(true);
      return;
    }

    // If the smallTalk param is present, trigger popup immediately. Must subscribe to a dynamic queryParamMap because queryParams aren't immediately available on pageload
    this.route.queryParamMap
      .pipe(
        take(2), // The param should be available on the second take
        tap((paramMap) => {
          const smallTalkParam = paramMap.get(PopupTriggerQueryParamKeys.SMALL_TALK);
          console.log('smallTalkParam', smallTalkParam);
          if (smallTalkParam && JSON.parse(smallTalkParam)) {
            this.triggerPopup();
            console.log('smallTalkParam found, triggering popup immediately', smallTalkParam);
            this.$popupDisabled.set(true);
          }
        })
      ).subscribe();

  }

  // Triggers the popup after user scrolls a certain percentage of page.
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const insufficientBrowsingTime = this.uiService.browsingSessionDuration < this.MINIMUM_BROWSING_TIME_FOR_POPUP;
    if (this.$popupDisabled() || this.uiService.$userAttemptedEmailVerification() || insufficientBrowsingTime) {
      return;
    }
    if (!this.uiService.window || !this.uiService.document) {
      return;
    }
    const threshold = 0.60; // represents the percentage of page scrolled
    const currentPosition = this.uiService.window.scrollY + this.uiService.window.innerHeight;
    const pageHeight = this.uiService.document.documentElement.scrollHeight;
    const scrollPercentage = (currentPosition / pageHeight);

    if (scrollPercentage > threshold) {
      console.log('Triggering popup from scroll');
      this.triggerPopup();
    }
  }

  // Triggers the popup after the mouse leaves the viewport
  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    const insufficientBrowsingTime = this.uiService.browsingSessionDuration < this.MINIMUM_BROWSING_TIME_FOR_POPUP;
    if (this.$popupDisabled() || this.uiService.$userAttemptedEmailVerification() || insufficientBrowsingTime) {
      return;
    }
    this.triggerPopup();
  }

  private triggerPopup() {
    const dialogConfig: MatDialogConfig = {
      disableClose: false,
      autoFocus: false,
      maxWidth: 800,
    };

    if (!this.$popupDisabled() && !this.uiService.$userAttemptedEmailVerification()) {
      this.$popupDisabled.set(true);
      this.dialogue.open(SubscribePopupDialogueComponent, dialogConfig);
    }
  }


}
