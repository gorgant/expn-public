import { HttpsOptions, onRequest } from "firebase-functions/v2/https";
import { validateRequestToken } from "../config/global-helpers";
import { SecretsManagerKeyNames } from "../../../shared-models/environments/env-vars.model";
import { logger } from "firebase-functions/v2";
import { cloudSchedulerServiceAccountSecret } from "../config/api-key-config";
import { Response } from "express";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { publicAppFirebaseInstance } from "../config/app-config";

const auth = getAuth(publicAppFirebaseInstance);

// Function to delete a batch of users
const deleteUserBatch = async (authUsers: UserRecord[]) => {
  for (const user of authUsers) {
    await auth.deleteUser(user.uid);
  }
}

const purgeAuthUsers = async (res: Response) => {

  const maxResults = 250; // Adjust as needed
  let pageToken;

  // Loop through all users
  try {
    do {
      const listUsersResult = await auth.listUsers(maxResults, pageToken);
      await deleteUserBatch(listUsersResult.users);
      logger.log('Deleting user batch', pageToken);

      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    res.send('All users have been deleted');
  } catch (error) {
    logger.error('Error deleting users:', error);
    res.status(500).send('Internal Server Error');
  }

}

/////// DEPLOYABLE FUNCTIONS ///////

const httpOptions: HttpsOptions = {
  secrets: [
    SecretsManagerKeyNames.CLOUD_SCHEDULER_SERVICE_ACCOUNT_EMAIL,
  ],
  timeoutSeconds: 400
};

export const onReqPurgeAuthUsers = onRequest(httpOptions, async (req, res) => {

  logger.log('onReqPurgeAuthUsers detected with these headers', req.headers);

  const expectedAudience = cloudSchedulerServiceAccountSecret.value();
  
  const isValid = await validateRequestToken(req, res, expectedAudience);
  
  if (!isValid) {
    logger.log('Request verification failed, terminating function');
    return;
  }

  await purgeAuthUsers(res);
});