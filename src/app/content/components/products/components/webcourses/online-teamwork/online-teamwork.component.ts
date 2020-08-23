import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { Product } from 'shared-models/products/product.model';

@Component({
  selector: 'app-online-teamwork',
  templateUrl: './online-teamwork.component.html',
  styleUrls: ['./online-teamwork.component.scss']
})
export class OnlineTeamworkComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() product: Product;

  constructor() { }

  ngOnInit() {
  }

}
