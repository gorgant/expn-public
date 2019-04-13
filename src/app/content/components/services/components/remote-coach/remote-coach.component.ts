import { Component, OnInit } from '@angular/core';
import { PageHeroData } from 'src/app/core/models/forms-and-components/page-hero-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { BuyNowBoxData } from 'src/app/core/models/forms-and-components/buy-now-box-data.model';

@Component({
  selector: 'app-remote-coach',
  templateUrl: './remote-coach.component.html',
  styleUrls: ['./remote-coach.component.scss']
})
export class RemoteCoachComponent implements OnInit {

  heroData: PageHeroData;
  buyNowData: BuyNowBoxData;
  imagePaths = ImagePaths;

  constructor() { }

  ngOnInit() {
    this.initializeHeroData();
    this.initializeBuyNowData();
  }

  private initializeHeroData() {
    this.heroData = {
      pageTitle: 'Remote Coach',
      pageSubtitle: 'Get professional, personalized feedback on your communication style, anywhere in the world',
      imageUrl: ImagePaths.REMOTE_COACH,
      actionMessage: 'Learn More'
    };
  }

  private initializeBuyNowData() {
    this.buyNowData = {
      title: 'Remote Coach',
      subtitle: 'Get professional, personalized feedback',
      buttonText: 'Get Started - $199'
    };
  }

}
