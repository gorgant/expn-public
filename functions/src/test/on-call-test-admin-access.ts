import { logger } from "firebase-functions/v2";
import { CallableOptions, CallableRequest, onCall } from "firebase-functions/v2/https";
import { adminFirestore } from "../config/db-config";
import { SharedCollectionPaths } from "../../../shared-models/routes-and-paths/fb-collection-paths.model";

const testAccess = async () => {
  const adminPostCollection = adminFirestore.collection(SharedCollectionPaths.POSTS);
  const adminPostCountQuery = await adminPostCollection.count().get()
  const adminPostCount = adminPostCountQuery.data().count;
  logger.log('Admin post count', adminPostCount);
}


/////// DEPLOYABLE FUNCTIONS ///////
const callableOptions: CallableOptions = {
  enforceAppCheck: false
};

export const onCallTestAccessToAdmin = onCall(callableOptions, async (request: CallableRequest<void>): Promise<void> => {
  const exportParams = request.data;
  logger.log('onCallTestAccessToAdmin requested with this data:', exportParams);

  await testAccess();
});