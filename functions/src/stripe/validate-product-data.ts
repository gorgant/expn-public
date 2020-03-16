import * as functions from 'firebase-functions';
import { Product } from '../../../shared-models/products/product.model';
import { assertUID, catchErrors } from '../config/global-helpers';
import { adminFirestore } from '../config/db-config';
import { SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';

export const validateProductOnAdmin = async (product: Product): Promise<boolean> => {
  const db: FirebaseFirestore.Firestore = adminFirestore;

  const adminProductDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(SharedCollectionPaths.PRODUCTS).doc(product.id).get()
    .catch(err => {console.log(`Error fetching product from admin database:`, err); return err;});
  
  // Verify product exists
  if (!adminProductDoc.exists) {
    console.log('Product does not exist');
    return false;
  }

  const adminProduct: Product = adminProductDoc.data() as Product;

  // Verify product price matches admin record
  if (adminProduct.price !== product.price) {
    console.log('Client product price does not match admin product price');
    return false;
  }

  console.log('Product price matches admin record');
  return true;
}


/////// DEPLOYABLE FUNCTIONS ///////

export const validateProductData = functions.https.onCall( async (product: Product, context) => {
  console.log('Validate product data request received with this data', product);
  assertUID(context);

  return await catchErrors(validateProductOnAdmin(product)) as boolean;
});