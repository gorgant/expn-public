import { Component, OnInit } from '@angular/core';
import { PublicAppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {

  appRoutes = PublicAppRoutes;

  constructor() { }

  ngOnInit() {
  }

}
