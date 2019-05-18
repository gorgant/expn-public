import { Component, OnInit } from '@angular/core';
import { PublicImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';


@Component({
  selector: 'app-remote-coach',
  templateUrl: './remote-coach.component.html',
  styleUrls: ['./remote-coach.component.scss']
})
export class RemoteCoachComponent implements OnInit {

  imagePaths = PublicImagePaths;

  constructor( ) { }

  ngOnInit() { }

}
