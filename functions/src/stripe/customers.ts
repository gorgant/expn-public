import { assert } from './helpers';
import { db, stripe } from './config'; 
import { AnonymousUser } from '../../../shared-models/user/anonymous-user.model';
import { FbCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';

/**
Read the user document from Firestore
*/
export const getUser = async(uid: string) => {
    return await db.collection(FbCollectionPaths.ANONYMOUS_USERS).doc(uid).get().then(doc => doc.data() as AnonymousUser);
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
export const updateUser = async(uid: string, user: AnonymousUser | Partial<AnonymousUser>) => {
    return await db.collection(FbCollectionPaths.ANONYMOUS_USERS).doc(uid).set(user, { merge: true })
}

/**
Takes a Firebase user and creates a Stripe customer account
*/
export const createCustomer = async(uid: any) => {
    const customer = await stripe.customers.create({
        metadata: { firebaseUID: uid }
    })

    const fbUser: Partial<AnonymousUser> = {
        stripeCustomerId: customer.id
    }

    await updateUser(uid, fbUser);

    return customer;
}



/**
Read the stripe customer ID from firestore, or create a new one if missing
*/
export const getOrCreateCustomer = async(uid: string) => {
    
    const user = await getUser(uid);
    const customerId = user && user.stripeCustomerId;

    // If missing customerID, create it
    if (!customerId) {
        return createCustomer(uid);
    } else {
        return stripe.customers.retrieve(customerId);
    }

}
