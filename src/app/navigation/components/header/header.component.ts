import { Component, OnInit, ViewChild } from '@angular/core';
import { UiService } from 'src/app/core/services/ui.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';
import { metaTagDefaults } from 'shared-models/analytics/metatags.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild('matButton', { static: false }) matButton;
  activeUrl$: Observable<string>;
  appRoutes = PublicAppRoutes;
  siteName = metaTagDefaults.explearningPublic.metaTagSiteName;

  constructor(
    private uiService: UiService,
    private router: Router,
  ) { }

  ngOnInit() {
    // Used in template to determine which header content to show
    this.activeUrl$ = this.router.events.pipe(
      filter(event =>
        event instanceof NavigationEnd
      ),
      map(event => {
        return this.router.url;
      })
    );
  }



  // Open/close side nav
  onToggleSidenav() {
    this.uiService.dispatchSideNavClick();
    // Clears sticky focus bug on menu icon
    this.matButton._elementRef.nativeElement.blur();
  }

}
