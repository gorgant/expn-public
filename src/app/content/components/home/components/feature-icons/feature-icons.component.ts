import { Component, OnInit } from '@angular/core';
import { metaTagsContentPages } from 'shared-models/analytics/metatags.model';

@Component({
  selector: 'app-feature-icons',
  templateUrl: './feature-icons.component.html',
  styleUrls: ['./feature-icons.component.scss']
})
export class FeatureIconsComponent implements OnInit {

  capTitleOne = metaTagsContentPages.explearningPublic.homeCapTitleOne;
  capBodyOne = metaTagsContentPages.explearningPublic.homeCapBodyOne;
  capIconOnePath = metaTagsContentPages.explearningPublic.homeCapIconOnePath;

  capTitleTwo = metaTagsContentPages.explearningPublic.homeCapTitleTwo;
  capBodyTwo = metaTagsContentPages.explearningPublic.homeCapBodyTwo;
  capIconTwoPath = metaTagsContentPages.explearningPublic.homeCapIconTwoPath;

  capTitleThree = metaTagsContentPages.explearningPublic.homeCapTitleThree;
  capBodyThree = metaTagsContentPages.explearningPublic.homeCapBodyThree;
  capIconThreePath = metaTagsContentPages.explearningPublic.homeCapIconThreePath;

  constructor() { }

  ngOnInit() {
  }

}
