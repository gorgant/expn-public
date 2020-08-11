import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { Product } from 'shared-models/products/product.model';
import { BuyNowBoxData } from 'shared-models/products/buy-now-box-data.model';

@Component({
  selector: 'app-remote-work',
  templateUrl: './remote-work.component.html',
  styleUrls: ['./remote-work.component.scss']
})
export class RemoteWorkComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() product: Product;
  @Input() buyNowData: BuyNowBoxData;

  constructor() { }

  ngOnInit() {
  }

}
