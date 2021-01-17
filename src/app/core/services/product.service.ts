import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { takeUntil, map, catchError, take, tap } from 'rxjs/operators';
import { UiService } from './ui.service';
import { Product } from 'shared-models/products/product.model';
import { SharedCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { TransferStateKeys } from 'shared-models/ssr/ssr-vars';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private uiService: UiService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  fetchAllProducts(): Observable<Product[]> {

    const ALL_PRODUCTS_KEY = makeStateKey<Product[]>(TransferStateKeys.ALL_PRODUCTS_KEY); // A key to identify data in USSR

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(ALL_PRODUCTS_KEY)) {
      console.log('Fetching products from transfer state');
      const cacheData = this.transferState.get<Product[]>(ALL_PRODUCTS_KEY, {} as any);
      cacheData.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : ((b.listOrder > a.listOrder) ? -1 : 0));
      this.transferState.remove(ALL_PRODUCTS_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const productsCollection = this.getProductsCollection();
    return productsCollection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(products => {
          console.log('Fetched all products');
          return products;
        }),
        tap(products => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(ALL_PRODUCTS_KEY, products); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  fetchSingleProduct(productId: string): Observable<Product> {

    const SINGLE_PRODUCT_KEY = makeStateKey<Product>(`${productId}-${TransferStateKeys.SINGLE_PRODUCT_KEY}`);

    // If data exists in state transfer, use that
    if (this.transferState.hasKey(SINGLE_PRODUCT_KEY)) {
      console.log('Fetching single product from transfer state');
      const cacheData = this.transferState.get<Product>(SINGLE_PRODUCT_KEY, {} as any);
      this.transferState.remove(SINGLE_PRODUCT_KEY); // Clean up the cache
      return of(cacheData);
    }

    // Otherwise, fetch from database
    const productDoc = this.getProductDoc(productId);
    return productDoc.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(product => {
          console.log('Fetched single product');
          return product;
        }),
        tap(product => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SINGLE_PRODUCT_KEY, product); // Stash item in transfer state
          }
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, 5000);
          return throwError(error);
        })
      );
  }

  private getProductsCollection(): AngularFirestoreCollection<Product> {
    return this.afs.collection<Product>(SharedCollectionPaths.PRODUCTS);
  }

  private getProductDoc(productId: string): AngularFirestoreDocument<Product> {
    return this.getProductsCollection().doc<Product>(productId);
  }
}
