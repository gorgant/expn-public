import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';

@Component({
  selector: 'app-remote-work',
  templateUrl: './remote-work.component.html',
  styleUrls: ['./remote-work.component.scss']
})
export class RemoteWorkComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() productId: string;

  constructor() { }

  ngOnInit() {
  }

}
