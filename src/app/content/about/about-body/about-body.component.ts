import { Component } from '@angular/core';
import { ShorthandBusinessNames } from '../../../../../shared-models/meta/business-info.model';
import { PublicImagePaths } from '../../../../../shared-models/routes-and-paths/image-paths.model';

@Component({
  selector: 'app-about-body',
  standalone: true,
  imports: [],
  templateUrl: './about-body.component.html',
  styleUrl: './about-body.component.scss'
})
export class AboutBodyComponent {

  SHORTHAND_NAME = ShorthandBusinessNames.EXPN;

  FOUNDER_AVATAR_URL_MDR = PublicImagePaths.FOUNDER_AVATAR_MDR;
  FOUNDER_AVATAR_URL_GCR = PublicImagePaths.FOUNDER_AVATAR_GCR;

}
