import { Component, OnInit, Input } from '@angular/core';
import { ProductData } from 'src/app/core/models/products/product-data.model';

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.scss']
})
export class ProductSummaryComponent implements OnInit {

  @Input() productData: ProductData;

  constructor() { }

  ngOnInit() {
  }

}
