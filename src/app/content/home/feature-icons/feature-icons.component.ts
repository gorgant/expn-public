import { Component } from '@angular/core';
import { SiteSpecificFieldValues } from '../../../../../shared-models/content/string-vals.model';

@Component({
  selector: 'app-feature-icons',
  standalone: true,
  imports: [],
  templateUrl: './feature-icons.component.html',
  styleUrl: './feature-icons.component.scss'
})
export class FeatureIconsComponent {

  CAPTION_TITLE_ONE = SiteSpecificFieldValues.expnPublic.homeCapTitleOne;
  CAPTION_BODY_ONE = SiteSpecificFieldValues.expnPublic.homeCapBodyOne;
  CAPTION_ICON_PATH_ONE= SiteSpecificFieldValues.expnPublic.homeCapIconOnePath;

  CAPTION_TITLE_TWO = SiteSpecificFieldValues.expnPublic.homeCapTitleTwo;
  CAPTION_BODY_TWO = SiteSpecificFieldValues.expnPublic.homeCapBodyTwo;
  CAPTION_ICON_PATH_TWO = SiteSpecificFieldValues.expnPublic.homeCapIconTwoPath;

  CAPTION_TITLE_THREE= SiteSpecificFieldValues.expnPublic.homeCapTitleThree;
  CAPTION_BODY_THREE= SiteSpecificFieldValues.expnPublic.homeCapBodyThree;
  CAPTION_ICON_PATH_THREE= SiteSpecificFieldValues.expnPublic.homeCapIconThreePath;


}
