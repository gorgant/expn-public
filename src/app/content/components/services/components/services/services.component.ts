import { Component, OnInit } from '@angular/core';
import { PRODUCT_CATALOGUE } from 'src/app/core/models/products/product-catalogue.model';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {

  productCatalogue = PRODUCT_CATALOGUE;
  // imagePaths = ImagePaths;

  constructor() { }

  ngOnInit() {
  }

}
