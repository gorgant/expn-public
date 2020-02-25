import { assert } from '../config/global-helpers';
import { db, stripe } from './config'; 
import { PublicUser } from '../../../shared-models/user/public-user.model';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { StripeCustomerMetadata } from '../../../shared-models/billing/stripe-object-metadata.model';
import { Stripe as StripeDefs} from 'stripe';

/**
Read the user document from Firestore
*/
export const getUser = async(uid: string) => {
    return await db.collection(PublicCollectionPaths.PUBLIC_USERS).doc(uid).get().then(doc => doc.data() as PublicUser);
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
    return await db.collection(PublicCollectionPaths.PUBLIC_USERS).doc(uid).set(user, { merge: true })
}

/**
Takes a Firebase user and creates a Stripe customer account
*/
export const createCustomer = async(uid: any) => {
    const customer = await stripe.customers.create({
        metadata: { [StripeCustomerMetadata.PUBLIC_USER_ID]: uid }
    })

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
        return stripe.customers.retrieve(customerId) as Promise<StripeDefs.Customer>;
    }

}
