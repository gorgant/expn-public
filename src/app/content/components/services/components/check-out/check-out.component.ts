import { Component, OnInit } from '@angular/core';
import { ProductData } from 'src/app/core/models/products/product-data.model';
import { ImagePaths } from 'src/app/core/models/routes-and-paths/image-paths.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreSelectors } from 'src/app/root-store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit {

  productData$: Observable<ProductData>;

  imagePaths = ImagePaths;

  constructor(
    private store$: Store<RootStoreState.State>
  ) { }

  ngOnInit() {
    this.initializeProductData();
  }

  private initializeProductData() {
    this.productData$ = this.store$.select(
      UserStoreSelectors.selectProductData
    );
  }
}
