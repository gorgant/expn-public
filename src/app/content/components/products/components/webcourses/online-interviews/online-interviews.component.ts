import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { Product } from 'shared-models/products/product.model';

@Component({
  selector: 'app-online-interviews',
  templateUrl: './online-interviews.component.html',
  styleUrls: ['./online-interviews.component.scss']
})
export class OnlineInterviewsComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() product: Product;

  constructor() { }

  ngOnInit() {
  }

}
