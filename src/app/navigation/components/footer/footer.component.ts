import { Component, OnInit } from '@angular/core';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';
import { SocialUrls } from 'src/app/core/models/routes-and-paths/social-urls.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  appRoutes = AppRoutes;
  socialUrls = SocialUrls;

  constructor() { }

  ngOnInit() {
  }

}
