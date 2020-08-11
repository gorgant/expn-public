import { Component, OnInit, Input } from '@angular/core';
import { PublicImagePaths } from 'shared-models/routes-and-paths/image-paths.model';
import { Product } from 'shared-models/products/product.model';

@Component({
  selector: 'app-executive-presence',
  templateUrl: './executive-presence.component.html',
  styleUrls: ['./executive-presence.component.scss']
})
export class ExecutivePresenceComponent implements OnInit {

  imagePaths = PublicImagePaths;

  @Input() product: Product;

  constructor() { }

  ngOnInit() {

  }
}
