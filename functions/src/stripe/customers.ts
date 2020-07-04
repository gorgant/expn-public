import { assert } from '../config/global-helpers';
import { db, stripe } from './config'; 
import { PublicUser } from '../../../shared-models/user/public-user.model';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { StripeCustomerMetadata } from '../../../shared-models/billing/stripe-object-metadata.model';
import { Stripe as StripeDefs} from 'stripe';
import * as functions from 'firebase-functions';

/**
Read the user document from Firestore
*/
export const getUser = async(uid: string) => {
	const userDoc = await db.collection(PublicCollectionPaths.PUBLIC_USERS).doc(uid).get()
		.catch(err => {functions.logger.log(`Error getting public user from public database:`, err); throw new functions.https.HttpsError('internal', err);});
	const publicUser = userDoc.data() as PublicUser;
	return publicUser;
}

/**
Gets a customer from Stripe
*/
export const getStripeCustomerId = async(uid: string) => {
	const user = await getUser(uid);
	return assert(user, 'stripeCustomerId') as string;
}

/**
Updates the user document non-destructively

UID requred because sometimes user update is partial
*/
export const updateUser = async(uid: string, user: PublicUser | Partial<PublicUser>) => {
	const userDoc = db.collection(PublicCollectionPaths.PUBLIC_USERS).doc(uid);
	await userDoc.set(user, { merge: true })
		.catch(err => {functions.logger.log(`Error updating user on public database:`, err); throw new functions.https.HttpsError('internal', err);});
}

/**
Takes a Firebase user and creates a Stripe customer account
*/
export const createCustomer = async(uid: any) => {
	const customer = await stripe.customers.create({
			metadata: { [StripeCustomerMetadata.PUBLIC_USER_ID]: uid }
	})
		.catch(err => {functions.logger.log(`Error creating customer on stripe:`, err); throw err;});

	const publicUser: Partial<PublicUser> = {
			stripeCustomerId: customer.id
	}
	await updateUser(uid, publicUser);
	return customer;
}



/**
Read the stripe customer ID from firestore, or create a new one if missing
*/
export const getOrCreateCustomer = async(uid: string): Promise<StripeDefs.Customer> => {
    
	const user = await getUser(uid);
	const customerId = user && user.stripeCustomerId;

	// If missing customerID, create it
	if (!customerId) {
		return createCustomer(uid);
	} else {
		const customer = stripe.customers.retrieve(customerId)
			.catch(err => {functions.logger.log(`Error creating customer on stripe:`, err); throw err;}) as Promise<StripeDefs.Customer>
		return customer;
	}

}
