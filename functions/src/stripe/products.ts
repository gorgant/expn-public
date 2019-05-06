import { db } from './config';
import { Product } from '../../../shared-models/products/product.model';
import { FbCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';

export const getProduct = async(productId: string) => {
  return await db.collection(FbCollectionPaths.PRODUCTS).doc(productId).get().then(doc => doc.data() as Product);
}