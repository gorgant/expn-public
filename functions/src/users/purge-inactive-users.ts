import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; // Imported for type definition only
import { now } from 'moment';
import { explearningPublicApp } from '../config/app-config';

const publicApp = explearningPublicApp;

const isExpiredUser = (user: admin.auth.UserRecord): boolean => {
  // Optionally, you could go into user's Firestore profile for a more nuanced expiration asssesment

  // const publicUserDocSnapshot: FirebaseFirestore.DocumentSnapshot = await db.collection(PublicCollectionPaths.PUBLIC_USERS).doc(user.uid).get();
  // const publicUser: PublicUser = publicUserDocSnapshot.data() as PublicUser;
  // console.log(`Fetched this user data ${publicUser} from this user ${user}`, );
  // const expirationPeriod = 1000 * 60 * 60 * 24 * 14;
  
  // if (publicUser && publicUser.lastAuthenticated < now() - expirationPeriod) {
  //   console.log(`Expired user detected, no auth in the last ${expirationPeriod} ms`)
  //   return true;
  // }
  // return false;

  const expirationPeriod = 1000 * 60 * 60 * 24 * 14; // 14 days
  const lastSignIn = Date.parse(user.metadata.lastSignInTime);
  if (lastSignIn < now() - expirationPeriod) {
    return true;
  }
  return false;
}

// Scan users and delete expired ones
const identifyAndDeleteExpiredUsers = async (nextPageToken?: string) => {

  console.log('Scanning users with this token', nextPageToken);

  const publicUserList: admin.auth.ListUsersResult = await publicApp.auth().listUsers(50, nextPageToken)
    .catch(err => {console.log(`Failed to fetch users from public database:`, err); return err;});
  
  let expiredUserCount = 0;

  const deleteQualifiedUsersRequests = publicUserList.users.map( async(user) => {
    const userExpired: boolean = isExpiredUser(user);
      
    if (userExpired) {
      await publicApp.auth().deleteUser(user.uid)
        .catch(err => {console.log(`Error deleting user from public database:`, err); return err;});
      expiredUserCount ++;
    }
  });

  await Promise.all(deleteQualifiedUsersRequests)
    .catch(err => {console.log(`Error in group promise deleting users:`, err); return err;});
  
  console.log(`This batch of ${expiredUserCount} expired users deleted`);

  return publicUserList;
}


/////// DEPLOYABLE FUNCTIONS ///////

// A cron job triggers this function, scans the list of anonymous users and deletes expired ones
export const purgeInactiveUsers = functions.https.onRequest( async (req, res ) => {
  console.log('Purge inactive users request received with these headers', req.headers);

  if (req.headers['user-agent'] !== 'Google-Cloud-Scheduler') {
    console.log('Invalid request, ending operation');
    return;
  }

  let userScanResults = await identifyAndDeleteExpiredUsers()
    .catch(err => {console.log(`Error scanning users:`, err); return err;});

  // If more than 1000 users, run scan again
  while (userScanResults.pageToken) {
    console.log('Running next batch of users');
    // List next batch of users.
    userScanResults = await identifyAndDeleteExpiredUsers(userScanResults.pageToken)
      .catch(err => {console.log(`Error scanning next batch of users:`, err); return err;});
  }

  
  
  return res.status(200).send('Scan completed');
})