import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; // Imported for type definition only
import { now } from 'moment';
import { expnPublicApp } from '../config/app-config';

const publicApp = expnPublicApp;

const isExpiredUser = (user: admin.auth.UserRecord): boolean => {
  // Optionally, you could go into user's Firestore profile for a more nuanced expiration asssesment

  // const publicUserDocSnapshot: FirebaseFirestore.DocumentSnapshot = await db.collection(PublicCollectionPaths.PUBLIC_USERS).doc(user.uid).get();
  // const publicUser: PublicUser = publicUserDocSnapshot.data() as PublicUser;
  // functions.logger.log(`Fetched this user data ${publicUser} from this user ${user}`, );
  // const expirationPeriod = 1000 * 60 * 60 * 24 * 14;
  
  // if (publicUser && publicUser.lastAuthenticated < now() - expirationPeriod) {
  //   functions.logger.log(`Expired user detected, no auth in the last ${expirationPeriod} ms`)
  //   return true;
  // }
  // return false;

  const expirationPeriod = 1000 * 60 * 60 * 24 * 14; // 14 days
  const lastSignIn = Date.parse(user.metadata.lastSignInTime);
  if (lastSignIn < (now() - expirationPeriod)) {
    return true;
  }
  return false;
}

// Scan users and delete expired ones
const identifyAndDeleteExpiredUsers = async (nextPageToken?: string) => {

  functions.logger.log('Scanning users with this token', nextPageToken);

  const publicUserList: admin.auth.ListUsersResult = await publicApp.auth().listUsers(50, nextPageToken)
    .catch(err => {functions.logger.log(`Failed to fetch users from public database:`, err); throw new functions.https.HttpsError('internal', err);});
  
  let expiredUserCount = 0;

  const deleteQualifiedUsersRequests = publicUserList.users.map( async(user) => {
    const userExpired: boolean = isExpiredUser(user);
      
    if (userExpired) {
      await publicApp.auth().deleteUser(user.uid)
        .catch(err => {functions.logger.log(`Error deleting user from public database:`, err); throw new functions.https.HttpsError('internal', err);});
      expiredUserCount ++;
    }
  });

  await Promise.all(deleteQualifiedUsersRequests);
  
  functions.logger.log(`This batch of ${expiredUserCount} expired users deleted`);

  return publicUserList;
}


/////// DEPLOYABLE FUNCTIONS ///////

// A cron job triggers this function, scans the list of anonymous users and deletes expired ones
export const purgeInactiveUsers = functions.https.onRequest( async (req, res ) => {
  functions.logger.log('Purge inactive users request received with these headers', req.headers);

  if (req.headers['user-agent'] !== 'Google-Cloud-Scheduler') {
    functions.logger.log('Invalid request, ending operation');
    return;
  }

  let userScanResults = await identifyAndDeleteExpiredUsers();

  // If more than 1000 users, run scan again
  while (userScanResults.pageToken) {
    functions.logger.log('Running next batch of users');
    // List next batch of users.
    userScanResults = await identifyAndDeleteExpiredUsers(userScanResults.pageToken);
  }

  
  
  res.status(200).send('Scan completed');
})
