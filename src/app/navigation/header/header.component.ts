import { Component, inject } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { PublicAppRoutes } from '../../../../shared-models/routes-and-paths/app-routes.model';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ShorthandBusinessNames } from '../../../../shared-models/meta/business-info.model';
import { UiService } from '../../core/services/ui.service';
import { WebsiteUrls } from '../../../../shared-models/meta/web-urls.model';
import { GlobalFieldValues } from '../../../../shared-models/content/string-vals.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, RouterLink, MatButtonModule, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  APP_ROUTES = PublicAppRoutes;
  SHORTHAND_BUSINESS_NAME = ShorthandBusinessNames.EXPN;
  ACADEMY_URL = WebsiteUrls.ACDMY_HOME;

  ABOUT_US_LINK_VALUE = GlobalFieldValues.ABOUT_US;
  BLOG_LINK_VALUE = GlobalFieldValues.BLOG;
  CONTACT_LINK_VALUE = GlobalFieldValues.CONTACT;
  HOME_LINK_VALUE = GlobalFieldValues.HOME;
  JOIN_COMMUNITY_LINK_VALUE = GlobalFieldValues.JOIN_COMMUNITY.toLocaleUpperCase();
  PODCAST_LINK_VALUE = GlobalFieldValues.PODCAST;


  uiService = inject(UiService);
}
