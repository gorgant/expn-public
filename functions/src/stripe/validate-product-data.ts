import * as functions from 'firebase-functions';
import { Product } from '../../../shared-models/products/product.model';
import { assertUID } from '../config/global-helpers';
import { adminFirestore } from '../config/db-config';
import { SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';

export const validateProductOnAdmin = async (product: Product): Promise<boolean> => {
  const db: FirebaseFirestore.Firestore = adminFirestore;

  const adminProductDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(SharedCollectionPaths.PRODUCTS).doc(product.id).get()
    .catch(err => {functions.logger.log(`Error fetching product from admin database:`, err); throw new functions.https.HttpsError('internal', err);});
  
  // Verify product exists
  if (!adminProductDoc.exists) {
    functions.logger.log('Product does not exist');
    return false;
  }

  const adminProduct: Product = adminProductDoc.data() as Product;

  // Verify product price matches admin record
  if (adminProduct.price !== product.price) {
    functions.logger.log('Client product price does not match admin product price');
    return false;
  }

  functions.logger.log('Product price matches admin record');
  return true;
}


/////// DEPLOYABLE FUNCTIONS ///////

export const validateProductData = functions.https.onCall( async (product: Product, context) => {
  functions.logger.log('Validate product data request received with this data', product);
  assertUID(context);

  return await validateProductOnAdmin(product);
});