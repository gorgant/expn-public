import * as functions from 'firebase-functions';
import { Stripe } from 'stripe';
import { publicFirestore } from '../config/db-config';

// Iniitialize Cloud Firestore Database
export const db = publicFirestore;
const settings = { timestampsInSnapshots: true };
db.settings(settings);

// ENV Variables
const stripeSecret: string = functions.config().stripe.secret;

//Export Stripe
const stripeConfig: Stripe.StripeConfig = {
  apiVersion: '2020-08-27'
}
export const stripe = new Stripe.Stripe(stripeSecret, stripeConfig);
