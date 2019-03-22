import { Component, OnInit, ViewChild } from '@angular/core';
import { UiService } from './shared/services/ui.service';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Explearning';

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private uiService: UiService
  ) {}

  ngOnInit() {
    this.configureSideNav();
  }

  // Handles sideNav clicks
  private configureSideNav() {
    this.uiService.sideNavSignal$.subscribe(signal => {
      this.toggleSideNav();
    });
  }

  // Opens and closes sidenav
  private toggleSideNav() {
    if (this.sidenav.opened) {
      this.sidenav.close();
    } else {
      this.sidenav.open();
    }
  }
}
