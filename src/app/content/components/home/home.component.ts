import { Component, OnInit } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  heroData: PageHeroData;
  appRoutes = AppRoutes;

  constructor() { }

  ngOnInit() {

    this.heroData = {
      pageTitle: 'Communications Coaching & Strategies',
      imageUrl: ImagePaths.HOME,
      actionMessage: 'Learn More'
    };
  }

}
