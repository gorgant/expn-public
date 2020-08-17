import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { Product } from 'shared-models/products/product.model';

@Component({
  selector: 'app-group-interviews',
  templateUrl: './group-interviews.component.html',
  styleUrls: ['./group-interviews.component.scss']
})
export class GroupInterviewsComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() product: Product;

  constructor() { }

  ngOnInit() {
  }

}
