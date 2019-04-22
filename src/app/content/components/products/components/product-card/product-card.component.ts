import { Component, OnInit, Input } from '@angular/core';
import { Product } from 'src/app/core/models/products/product.model';
import { Router } from '@angular/router';
import { AppRoutes } from 'src/app/core/models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input() product: Product;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate([AppRoutes.PRODUCT_INDIVIDUAL, this.product.id]);
  }

}
