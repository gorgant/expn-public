import { db } from './config';
import { Product } from '../../../shared-models/products/product.model';

export const getProduct = async(productId: string) => {
  return await db.collection('products').doc(productId).get().then(doc => doc.data() as Product);
}