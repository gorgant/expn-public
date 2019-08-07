import * as functions from 'firebase-functions';
import { publicApp } from '../apps';
import * as admin from 'firebase-admin'; // Imported for type definition only
import { now } from 'moment';

const isExpiredUser = async (user: admin.auth.UserRecord): Promise<boolean> => {
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
const scanUsers = async (nextPageToken?: string) => {

  console.log('Scanning users with this token', nextPageToken);

  const publicUserList = await publicApp.auth().listUsers(50, nextPageToken);

  const deleteQualifiedUsersRequests = publicUserList.users.map( async(user) => {
    const userExpired: boolean = await isExpiredUser(user)
      .catch(error => {
        console.log('Error checking for expired user')
        return error;
      });
      
    if (userExpired) {
      console.log('Deleting user', user);
      await publicApp.auth().deleteUser(user.uid)
        .catch(error => {
          console.log('Error deleting user', error);
          return error;
        });
    }
  });

  await Promise.all(deleteQualifiedUsersRequests)
    .catch(error => {
      console.log('Error in delete users group promise', error)
      return error;
    });

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

  let userScanResults = await scanUsers();

  // If more than 1000 users, run scan again
  while (userScanResults.pageToken) {
    console.log('Running next batch of users');
    // List next batch of users.
    userScanResults = await scanUsers(userScanResults.pageToken)
      .catch(error => {
        console.log('Error scanning next batch of users', userScanResults.pageToken);
        return error;
      });
  }

  
  console.log('All users scanned', res);
  return res.status(200).send('Scan completed');
})