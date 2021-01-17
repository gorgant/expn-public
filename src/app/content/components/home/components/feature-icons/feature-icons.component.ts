import { Component, OnInit } from '@angular/core';
import { metaTagsContentPages } from 'shared-models/analytics/metatags.model';

@Component({
  selector: 'app-feature-icons',
  templateUrl: './feature-icons.component.html',
  styleUrls: ['./feature-icons.component.scss']
})
export class FeatureIconsComponent implements OnInit {

  capTitleOne = metaTagsContentPages.expnPublic.homeCapTitleOne;
  capBodyOne = metaTagsContentPages.expnPublic.homeCapBodyOne;
  capIconOnePath = metaTagsContentPages.expnPublic.homeCapIconOnePath;

  capTitleTwo = metaTagsContentPages.expnPublic.homeCapTitleTwo;
  capBodyTwo = metaTagsContentPages.expnPublic.homeCapBodyTwo;
  capIconTwoPath = metaTagsContentPages.expnPublic.homeCapIconTwoPath;

  capTitleThree = metaTagsContentPages.expnPublic.homeCapTitleThree;
  capBodyThree = metaTagsContentPages.expnPublic.homeCapBodyThree;
  capIconThreePath = metaTagsContentPages.expnPublic.homeCapIconThreePath;

  constructor() { }

  ngOnInit() {
  }

}
