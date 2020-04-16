import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';

@Component({
  selector: 'app-executive-presence',
  templateUrl: './executive-presence.component.html',
  styleUrls: ['./executive-presence.component.scss']
})
export class ExecutivePresenceComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() productId: string;

  constructor() { }

  ngOnInit() {

  }
}
