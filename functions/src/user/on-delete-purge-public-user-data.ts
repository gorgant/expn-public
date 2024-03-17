import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { EnvironmentTypes } from '../../../shared-models/environments/env-vars.model';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { currentEnvironmentType } from '../config/environments-config';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { PublicUser } from '../../../shared-models/user/public-user.model';
import { deleteSgContact } from '../email/helpers/delete-sg-contact';
import { convertPublicUserDataToEmailUserData } from '../config/global-helpers';

const removeContactFromSg = async (deletedUser: PublicUser) => {
  if (currentEnvironmentType === EnvironmentTypes.SANDBOX) {
    logger.log('Sandbox environment detected, aborting deleteSgContact request');
    return;
  }
  const userEmailData = convertPublicUserDataToEmailUserData(deletedUser);
  await deleteSgContact(userEmailData)
    .catch(err => {logger.log(`deleteSgContact failed":`, err); throw new HttpsError('internal', err);});
}

const executeActions = async(deletedUser: PublicUser) => {
  await removeContactFromSg(deletedUser);
  return true;
};

/////// DEPLOYABLE FUNCTIONS ///////

const watchedDocumentPath = `${PublicCollectionPaths.PUBLIC_USERS}/{wildcardUserId}`;

export const onDeletePurgePublicUserData = onDocumentDeleted(watchedDocumentPath, async (event) => {
  const deletedUser = event.data?.data() as PublicUser;
  logger.log('Detected deletePublicUser in database, processing removal of user data and account', deletedUser);

  const deletionResponse = await executeActions(deletedUser);
 
  return deletionResponse;
});