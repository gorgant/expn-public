import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'shared-models/products/product.model';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';

@Component({
  selector: 'app-dell-hymes',
  templateUrl: './dell-hymes.component.html',
  styleUrls: ['./dell-hymes.component.scss']
})
export class DellHymesComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() product: Product;

  constructor() { }

  ngOnInit(): void {
  }

}
