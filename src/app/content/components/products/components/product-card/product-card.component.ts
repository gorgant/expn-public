import { Component, OnInit, Input } from '@angular/core';
import { UiService } from 'src/app/core/services/ui.service';
import { Product } from 'shared-models/products/product.model';
import { PublicAppRoutes } from 'shared-models/routes-and-paths/app-routes.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input() product: Product;
  productUrlHandle: string;

  appRoutes = PublicAppRoutes;

  constructor(
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.setUserFriendlyUrlString();
  }

  private setUserFriendlyUrlString() {
    this.productUrlHandle = this.uiService.convertToFriendlyUrlFormat(this.product.name);
  }

}
